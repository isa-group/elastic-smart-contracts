/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';



const { Gateway, Wallets, } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');
const governify = require('governify-commons');
const logger = governify.getLogger().tag('index');
const getDirName = require('path').dirname;

var gateway = {};
var contract = {};

var config = {}
var intervalCalculate = {}
var csvTimeout = {}
var csvBody = {};

var ESCnumber = { counter: 0 };


/**
 * Configurates every variable necessary to run an esc.
 * @function
 * @param {object} configuration - The initial configuration object with the necessary variables.
 */
async function configurate(configuration,esc){
    config[esc] = JSON.parse(JSON.stringify(configuration));
    config[esc].analysisCommited = true;
    config[esc].changeFrequency = {change: false, newFrequency: 0};
    config[esc].data = [];
    config[esc].countCalculationsOverMax = 0;
    config[esc].calculationDates = [];
    config[esc].execTimes = [];
    config[esc].analysisHandler = 0;
    config[esc].hookDataHandler = 0;
    config[esc].flag = [];
    config[esc].analysisTime = {};
    config[esc].initial = {};
    config[esc].initialTimeCounter = 0;
    config[esc].analysisFailCounter = {};
    config[esc].timeStampInitAnalysis = {};
    config[esc].timeStampExecAnalysis = {};
    config[esc].timeStampFinalAnalysis = {};

    ESCnumber.counter++;
}


/**
 * Connects to the blockchain network using the configuration variables
 * @function
 */
async function connect(esc) {
    try {
        // load the network configuration
        let ccp = JSON.parse(fs.readFileSync(config[esc].conexionPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd()+'/esc_core/wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(config[esc].identityName);
        if (!identity) {
            console.log(`An identity for the user "${config[esc].identityName}" does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        gateway[esc] = new Gateway();
        await gateway[esc].connect(ccp, { wallet, identity: config[esc].identityName, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway[esc].getNetwork(config[esc].channelName);

        // Get the contract from the network.
        contract[esc] =  network.getContract(config[esc].chaincodeName);

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
    }
}


/**
 * Sets the event listener responsible for evaluating the elastic parameters periodically and adjusting the parameters accordingly.
 * @function
 */
async function harvesterListener(esc) {

    let [controlCount,avgExecTime] = [0,0];


    const listener = await contract[esc].addContractListener((event) => {

        event = event.payload.toString();
        event = JSON.parse(event); 

        if (event.type === 'analysis'){
            config[esc].analysisCommited = true;

            let end = process.hrtime(config[esc].initial[event.info[0][0]]);
            let analysisTime = ((end[0]* 1000000000 + end[1]) / 1000000) / 1000;

            avgExecTime += analysisTime/config[esc].frequencyControlCalculate;
            controlCount++;

            if(controlCount >= config[esc].frequencyControlCalculate){

                try{
                if(config[esc].elasticityMode === "timeWindow"){
                    
                    contract[esc].evaluateTransaction(config[esc].evaluateWindowTimeContract, config[esc].dataTimeLimit, avgExecTime, config[esc].maximumTimeAnalysis, config[esc].minimumTimeAnalysis).then((res) => {
                        let newTime = JSON.parse(res.toString());
                        if(newTime < 1){
                            newTime = 1;
                        }else if (newTime > 65536){
                            newTime = 65536;
                        }

                        if(newTime > config[esc].harvestFrequency && newTime != config[esc].dataTimeLimit){
                            config[esc].dataTimeLimit = newTime;
                            console.log("New Time Data: " + config[esc].dataTimeLimit)
                        }
                    });
                }else if(config[esc].elasticityMode === "harvestFrequency"){
                    contract[esc].evaluateTransaction(config[esc].evaluateHarvestFrequencyContract, config[esc].harvestFrequency, avgExecTime, config[esc].maximumTimeAnalysis, config[esc].minimumTimeAnalysis).then((res) => {
                        let newTime = JSON.parse(res.toString());
                        if(newTime < 5){
                            newTime = 5;
                        }else if (newTime > 60){
                            newTime = 60;
                        }
                        
                        if(newTime > 0 && newTime >= config[esc].analysisFrequency && newTime != config[esc].harvestFrequency){
                            logger.info("New Harvest Frequency: " + newTime);
                            config[esc].changeFrequency = {change: true, newFrequency: newTime}
                            config[esc].harvestFrequency = newTime;

                        }
                    });
                }
                } catch (err) {
                    console.log(err)
                }
                controlCount = 0;
                avgExecTime = 0;
            }
        }         
    });

    setTimeout(() => {
        //contract[esc].removeContractListener(listener);
    }, config[esc].executionTime*1000 + 100);
}


/**
 * This functions save the new data from the harvester until enough data for a batch to introduce is ready and the storage data is not currently in use
 * for analysis, then it submits the new data.
 * @function
 * @param {object} params - An object with any aditional param besides the default ones for the smart contract to use.
 * @param {object} newData - The new data to introduce in the blockchain or temporarely hold to introduce it later.
 */
function harvesterHook(params, newData, esc) {
    if((ESCnumber.counter == config[esc].numberOfESCs && config[esc].coldStart) || !config[esc].coldStart){
        try {

            config[esc].data.push(newData);
            config[esc].hookDataFailCounter = 0;

            if( config[esc].data.length >= 1 && config[esc].analysisCommited){
                config[esc].analysisCommited = false;
                let submit = config[esc].data;
                config[esc].data = [];

                params.data = JSON.stringify(submit);
                params.timeData = config[esc].dataTimeLimit;
                params.frequency = config[esc].harvestFrequency;
                params.dataPerHarvest = config[esc].dataPerHarvest;
                
                let check = setInterval (async function(){
                    if(config[esc].flag.length == 0){
                        clearInterval (check);
                        config[esc].flag.push(1)
                        contract[esc].submitTransaction(config[esc].updateDataContract, JSON.stringify(params)).then(() => {
                            config[esc].flag.pop();

                            logger.info('Data submitted to the blockchain');
                        }).catch((err)=> {
                            logger.error(err)
                        });
                    }else{
                        config[esc].hookDataFailCounter++;
                        if(config[esc].hookDataFailCounter > 10){
                            clearInterval (check);
                            config[esc].hookDataFailCounter = 0;
                            logger.error("Hook data transaction failed");
                            resolve();
                        }else{
                            logger.info("Another transaction is currently running, retrying hook...");
                        }
                    }
                },500);
            }
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
        }
    }
}

/**
 * This functions sets up a listener which recolect the analysis data and dump it into a file at the end of its execution.
 * It also calls the analysis function each time a new batch of data has been introduced in the blockchain.
 * @function
 * @param {object} params - An object with any aditional param besides the default ones for the smart contract to use.
 */
async function analyser(params,esc) {
    try {
        csvBody[esc] = "";
        // let csvBodyCalculated = "";
        let resultFile = config[esc].resultsPath+"/" + config[esc].experimentName + "_" + new Date().toLocaleDateString().replace("/","_").replace("/","_")+".csv";
        fs.readFile(resultFile, (err, data) => {
            if(err){
                csvBody[esc] = config[esc].csvResultsCalculationsHeader;
            }else{
                csvBody[esc] = data;
            }
        });
        //let resultCalculatedFile = config[esc].resultsPath +"/"+ config[esc].experimentName + "_results_" + new Date().toLocaleDateString().replace("/","_").replace("/","_")+".csv";
        // fs.readFile(resultCalculatedFile, (err, data) => {
        //     if(err){
        //         csvBodyCalculated = config[esc].csvResultsExperimentHeader;
        //     }else{
        //         csvBodyCalculated = data;
        //     }
        // });

        let fromDate = Date.now();

        const listener = await contract[esc].addContractListener( (event) => {
    
            event = event.payload.toString();
            event = JSON.parse(event); 
    
            if (event.type === 'analysis'){
    
                config[esc].dataTimeLimit = event.timeData;
    
                for(let j = 0; j< event.analysisList.length; j++){
    
                    if(config[esc].maximumTimeAnalysis < event.execDuration){
                        config[esc].countCalculationsOverMax++;
                    }
    
                    logger.info('An analysis has been executed with a duration of ' + event.execDuration + ' ms');
                    console.log(event.totalDataStoredList[j]);
                    
                    let end = process.hrtime(config[esc].initial[event.info[0][0]]);
                    let analysisTime = (end[0]* 1000000000 + end[1]) / 1000000;
                    console.log(analysisTime/1000);
                    csvBody[esc] += `${event.analysisList[j] + 1},${analysisTime/1000},${event.execDuration/1000},${config[esc].analysisFrequency},${event.timeData},${event.frequencyData},${event.totalDataStoredList[j]},${event.fromDates[j]},${event.fromDates[j] - (1000*event.timeData)},${config[esc].minimumTimeAnalysis},${config[esc].maximumTimeAnalysis},${ESCnumber.counter},${config[esc].analysisFailCounter[event.info[0][0]]},${config[esc].timeStampInitAnalysis[event.info[0][0]]},${config[esc].timeStampExecAnalysis[event.info[0][0]]},${Date.now()}`;
                    for (let i = 0; i < event.info.length; i++) {
                        csvBody[esc] += `,${event.info[i][j]}`
                    }
                    if((analysisTime/1000) > 0){
                        config[esc].execTimes.push(analysisTime/1000);
                    }  
                    
                    csvBody[esc] += `\n`
                }                 
         
            }   
           
        });

        setTimeout(() => {
            intervalCalculate[esc] = setInterval(intAnalysis, config[esc].analysisFrequency*1000);

            async function intAnalysis (){
                console.log(ESCnumber.counter);
                if((ESCnumber.counter == config[esc].numberOfESCs && config[esc].coldStart) || !config[esc].coldStart){
                    config[esc].calculationDates.push(fromDate);
                    params.timeData = config[esc].dataTimeLimit;
                    params.fromDates = JSON.stringify(config[esc].calculationDates);
                    params.frequency = config[esc].harvestFrequency;
                    logger.info("Launching analysis transaction");
                    config[esc].initial[config[esc].initialTimeCounter] = process.hrtime();
                    let analysisID = config[esc].initialTimeCounter
                    config[esc].initialTimeCounter++;
                    await analysis(params,esc,analysisID);
                    config[esc].calculationDates = [];
                    if(config[esc].elasticityMode==="harvestFrequency"){
                        clearInterval(intervalCalculate[esc]);
                        intervalCalculate[esc] = setInterval(intAnalysis, config[esc].analysisFrequency*1000);
                    }
                }
                fromDate += config[esc].analysisFrequency*1000;
            }

            setTimeout(() => {
                clearInterval(intervalCalculate[esc]);
            }, config[esc].executionTime*1000 + 500);
        }, 5000);


        csvTimeout[esc] = setTimeout(async () => {
            //contract[esc].removeContractListener(listener);
            fs.mkdir(getDirName(resultFile), { recursive: true}, function (err) {
                if (err) logger.error(err);
                fs.writeFileSync(resultFile, csvBody[esc],'utf8');
            });
            //gateway[esc].disconnect();
            // let min = config[esc].execTimes.reduce((a,b)=> {
            //     return b<a ? b : a;
            // });
            // let max = config[esc].execTimes.reduce((a,b)=> {
            //     return b>a ? b : a;
            // });
            // let avg = config[esc].execTimes.reduce((a,b)=> {
            //     return a+b;
            // })/config[esc].execTimes.length;
            // let stdev = config[esc].execTimes.map((a) => {
            //     return ((a - avg)**2)/config[esc].execTimes.length;
            // }).reduce((a,b)=> {
            //     return a+b;
            // });
            //csvBodyCalculated += `${config[esc].analysisFrequency},${config[esc].dataTimeLimit},${min},${max},${avg},${Math.sqrt(stdev)},${config[esc].execTimes.length},${config[esc].countCalculationsOverMax}\n`;
            // fs.mkdir(getDirName(resultCalculatedFile), { recursive: true}, function (err) {
            //     if (err) logger.error(err);
            //     fs.writeFileSync(resultCalculatedFile, csvBodyCalculated,'utf8');
            // });
            return true;
        }, config[esc].executionTime*1000 + 10000);


        


    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
    }
}


/**
 * This functions calls the analysis smart contract with the params given
 * @function
 * @param {object} params - An object with any aditional param besides the default ones for the smart contract to use.
 */
async function analysis(params,esc,analysisID) {
    return new Promise(async (resolve, reject) => {
        try {
            config[esc].analysisFailCounter[analysisID] = 0;
            const result = await contract[esc].evaluateTransaction(config[esc].queryAnalysisHolderContract, config[esc].analysisHolderId);
            params.analysisHolder = result.toString();
            params.analysisID = analysisID.toString();
            config[esc].timeStampInitAnalysis[analysisID] = Date.now();
            // Submit the specified transaction.
            let check = setInterval (async function(){
                if(config[esc].flag.length == 0){
                    clearInterval (check);
                    config[esc].flag.push(1);
                    config[esc].timeStampExecAnalysis[analysisID] = Date.now();
                    await contract[esc].submitTransaction(config[esc].analysisContract, JSON.stringify(params));
                    config[esc].flag.pop();
                    resolve();
                }else{
                    config[esc].analysisFailCounter[analysisID]++;
                    if(config[esc].analysisFailCounter[analysisID] > 10){
                        clearInterval (check);
                        config[esc].analysisFailCounter[analysisID] = 0;
                        logger.error("Analysis transaction failed");
                        resolve();
                    }else{
                        logger.info("Another transaction is currently running, retrying...");
                    }
                }
            },500);

            // Disconnect from the gateway.
            //await gateway.disconnect();

        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
        }
    });
}

/**
 * This functions returns an object which indicates if the frequency needs to be changed and the new one in that case.
 * @function
 */
async function getNewFrequency(esc) {
    return config[esc].changeFrequency;
}

/**
 * Once the frequency has changed this function sets the configuration parameter to not change the frequency.
  * @function
 */
async function frequencyChanged(esc) {
    config[esc].changeFrequency = {change: false, newTime: 0};
}

module.exports.harvesterHook = harvesterHook;
module.exports.harvesterListener = harvesterListener;
module.exports.connect = connect;
module.exports.analyser = analyser;
module.exports.configurate = configurate;
module.exports.getNewFrequency = getNewFrequency;
module.exports.frequencyChanged = frequencyChanged;
module.exports.ESCnumber = ESCnumber;
module.exports.intervalCalculate = function(esc) {
    return intervalCalculate[esc];
};
module.exports.csvTimeout = function(esc) {
    return csvTimeout[esc];
};
module.exports.csvBody = function(esc) {
    return csvBody[esc];
}