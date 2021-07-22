/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';



const { Gateway, Wallets, } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

var gateway = "";
var contract = "";

var config = {}

/**
 * Configurates every variable necessary to run an esc.
 * @function
 * @param {object} configuration - The initial configuration object with the necessary variables.
 */
async function configurate(configuration){
    config = JSON.parse(JSON.stringify(configuration));
    config.analysisCommited = true;
    config.changeFrequency = {change: false, newFrequency: 0};
    config.data = [];
    config.countCalculationsOverMax = 0;
    config.calculationDates = [];
    config.execTimes = [];
}


/**
 * Connects to the blockchain network using the configuration variables
 * @function
 */
async function connect() {
    try {
        // load the network configuration
        let ccp = JSON.parse(fs.readFileSync(config.conexionPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd()+'/esc_core/wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(config.identityName);
        if (!identity) {
            console.log(`An identity for the user "${config.identityName}" does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: config.identityName, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(config.channelName);

        // Get the contract from the network.
        contract =  network.getContract(config.chaincodeName);

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}


/**
 * Sets the event listener responsible for evaluating the elastic parameters periodically and adjusting the parameters accordingly.
 * @function
 */
async function harvesterListener() {

    let warmUp = true;
    let controlCount = 0;
    let avgExecTime = 0;


    const listener = await contract.addContractListener((event) => {

        event = event.payload.toString();
        event = JSON.parse(event); 

        if (event.type === 'analysis' && config.chaincodeName == event.chaincode){
            config.analysisCommited = true;
            if(warmUp){

                avgExecTime += event.execDuration/config.frequencyControlCalculate;
                controlCount++;

                if(avgExecTime > config.minimumTimeAnalysis){

                    warmUp = false;
                    
                }else if(controlCount >= config.frequencyControlCalculate){
                    controlCount = 0;
                    avgExecTime = 0;
                }

            }else if(!warmUp && controlCount >= config.frequencyControlCalculate && config.elasticityMode == 2){

                avgExecTime += event.execDuration/config.frequencyControlCalculate;
                
                contract.evaluateTransaction(config.evaluateHistoryContract, config.dataTimeLimit, avgExecTime, config.maximumTimeAnalysis, config.minimumTimeAnalysis).then((res) => {
                    let newTime = JSON.parse(res.toString());
                    if(newTime < 32){
                        newTime = 32;
                    }else if (newTime > 65536){
                        newTime = 65536;
                    }

                    if(newTime > 0 && newTime != config.dataTimeLimit){
                        config.dataTimeLimit = newTime;
                        console.log("New Time Data: " + config.dataTimeLimit)
                    }
                });
                controlCount = 0;
                avgExecTime = 0;
            }else if(!warmUp && controlCount >= config.frequencyControlCalculate && config.elasticityMode >= 3){
                avgExecTime += event.execDuration/config.frequencyControlCalculate;
                
                contract.evaluateTransaction(config.evaluateFrequencyContract, config.harvestFrequency, avgExecTime, config.maximumTimeAnalysis, config.minimumTimeAnalysis).then((res) => {
                    let newTime = JSON.parse(res.toString());
                    if(newTime < 0.1){
                        newTime = 0.1;
                    }else if (newTime > 60){
                        newTime = 60;
                    }

                    if(newTime > 0 && newTime != config.harvestFrequency){

                        config.changeFrequency = {change: true, newFrequency: newTime}

                    }
                });
                controlCount = 0;
                avgExecTime = 0;
            }else if(!warmUp && controlCount < config.frequencyControlCalculate){
                controlCount++;
                avgExecTime += event.execDuration/config.frequencyControlCalculate;
            }
        }         
    });

    setTimeout(() => {
        contract.removeContractListener(listener);
    }, config.executionTime*1000 + 100);
}


/**
 * This functions save the new data from the harvester until enough data for a batch to introduce is ready and the storage data is not currently in use
 * for analysis, then it submits the new data.
 * @function
 * @param {object} params - An object with any aditional param besides the default ones for the smart contract to use.
 * @param {object} newData - The new data to introduce in the blockchain or temporarely hold to introduce it later.
 */
async function harvesterHook(params, newData) {
    try {

        config.data.push(newData);

        if( (config.data.length >= 3 || config.chaincodeName == "intersection") && config.analysisCommited){
            let totalBeginHR = process.hrtime();
            let totalBegin = totalBeginHR[0] * 1000000 + totalBeginHR[1] / 1000;
            config.analysisCommited = false;
            let submit = config.data;
            config.data = [];

            params.data = JSON.stringify(submit);
            params.timeData = config.dataTimeLimit;
            params.frequency = config.harvestFrequency;

            const result = await contract.evaluateTransaction(config.queryDataStorageContract);

            params.dataStorage = result.toString();

            contract.submitTransaction(config.updateDataContract, JSON.stringify(params)).then(() => {
                let totalEndHR = process.hrtime()
                let totalEnd = totalEndHR[0] * 1000000 + totalEndHR[1] / 1000;
                let totalDuration = (totalEnd - totalBegin) / 1000;

                console.log('Transaction has been submitted with an execution time of '+ totalDuration + ' ms');
            });
        }



    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

/**
 * This functions sets up a listener which recolect the analysis data and dump it into a file at the end of its execution.
 * It also calls the analysis function each time a new batch of data has been introduced in the blockchain.
 * @function
 * @param {object} params - An object with any aditional param besides the default ones for the smart contract to use.
 */
async function analyser(params) {
    try {

        let csvBody = "";
        let csvBodyCalculated = "";
        let resultFile = config.resultsPath+"/" + config.experimentName + "_" + new Date().toLocaleDateString().replace("/","_").replace("/","_")+".csv";
        fs.readFile(resultFile, (err, data) => {
            if(err){
                csvBody = config.csvResultsCalculationsHeader;
            }else{
                csvBody = data;
            }
        });
        let resultCalculatedFile = config.resultsPath +"/"+ config.experimentName + "_results_" + new Date().toLocaleDateString().replace("/","_").replace("/","_")+".csv";
        fs.readFile(resultCalculatedFile, (err, data) => {
            if(err){
                csvBodyCalculated = config.csvResultsExperimentHeader;
            }else{
                csvBodyCalculated = data;
            }
        });

        let fromDate = Date.now();
       
        const listener = await contract.addContractListener((event) => {
    
            event = event.payload.toString();
            event = JSON.parse(event); 
    
            if (event.type === 'analysis' && config.chaincodeName == event.chaincode){
    
                config.dataTimeLimit = event.timeData;
    
                for(let j = 0; j< event.analysisList.length; j++){
    
                    if(config.maximumTimeAnalysis*1.5 < event.execDuration){
                        config.countCalculationsOverMax++;
                    }
    
                    console.log('An analysis has beeen executed with a total number of '+ event.analysisList[j] + ' data objects and a duration of ' + event.execDuration + ' ms');
                    csvBody += `${event.analysisList[j]},${event.execDuration},${config.analysisFrequency},${event.timeData},${event.frequencyData},${event.totalDataStoredList[j]},${event.fromDates[j]},${event.fromDates[j] - (1000*event.timeData)},${config.minimumTimeAnalysis},${config.maximumTimeAnalysis}`;
                    for (let i = 0; i < event.info.length; i++) {
                        csvBody += `,${event.info[i][j]}`
                    }
                    
                    csvBody += `\n`
                }
    
                console.log(`Analysis event detected, waiting ${config.analysisFrequency} seconds to launch transaction`);
                if(config.chaincodeName == 'intersection'){
                    console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
                    console.log(event.execDuration)
                }
                if(event.execDuration > 0){
                    config.execTimes.push(event.execDuration);
                }
    
    
            }else if (event.type === 'updateData' && config.chaincodeName == event.chaincode){
    
                
                if(config.calculationDates.length> 0){
                    console.log("Launching analysis transaction");
                }
                params.timeData = event.timeData;
                params.fromDates = JSON.stringify(config.calculationDates);
                params.frequency = event.frequency;
                analysis(params);
                config.calculationDates = [];                        
                 
         
            }   
           
        });


        let intervalCalculate = setInterval(() => {
            
            config.calculationDates.push(fromDate);
            fromDate += config.analysisFrequency*1000;
        }, config.analysisFrequency*1000);


        setTimeout(() => {
            clearInterval(intervalCalculate);
        }, config.executionTime*1000 + 500);

        setTimeout(() => {
            contract.removeContractListener(listener);
            fs.writeFileSync(resultFile, csvBody,'utf8');
            gateway.disconnect();
            let min = config.execTimes.reduce((a,b)=> {
                if(b<a){
                    return b
                }else{
                    return a
                }
            });
            let max = config.execTimes.reduce((a,b)=> {
                if(b>a){
                    return b
                }else{
                    return a
                }
            });
            let avg = config.execTimes.reduce((a,b)=> {
                return a+b;
            })/config.execTimes.length;
            let stdev = config.execTimes.map((a) => {
                return ((a - avg)**2)/config.execTimes.length;
            })
            .reduce((a,b)=> {
                return a+b;
            });
            csvBodyCalculated += `${config.analysisFrequency},${config.dataTimeLimit},${min},${max},${avg},${Math.sqrt(stdev)},${config.execTimes.length},${config.countCalculationsOverMax}\n`;
            fs.writeFileSync(resultCalculatedFile, csvBodyCalculated,'utf8');
            return true;
        }, config.executionTime*1000 + 10000);


        


    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}


/**
 * This functions calls the analysis smart contract with the params given
 * @function
 * @param {object} params - An object with any aditional param besides the default ones for the smart contract to use.
 */
async function analysis(params) {
    try {
        

        const result = await contract.evaluateTransaction(config.queryAnalysisHolderContract);

        params.analysisHolder = result.toString();
        // Submit the specified transaction.

        await contract.submitTransaction(config.analysisContract, JSON.stringify(params));

        // Disconnect from the gateway.
        //await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

/**
 * This functions returns an object which indicates if the frequency needs to be changed and the new one in that case.
 * @function
 */
async function getNewFrequency() {
    return config.changeFrequency;
}

/**
 * Once the frequency has changed this function sets the configuration parameter to not change the frequency.
  * @function
 */
async function frequencyChanged() {
    config.changeFrequency = {change: false, newTime: 0};
}

module.exports.harvesterHook = harvesterHook;
module.exports.harvesterListener = harvesterListener;
module.exports.connect = connect;
module.exports.analyser = analyser;
module.exports.configurate = configurate;
module.exports.getNewFrequency = getNewFrequency;
module.exports.frequencyChanged = frequencyChanged;

