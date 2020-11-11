/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const yargs = require('yargs');
const { Gateway, Wallets, } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

const argv = yargs
    .command('launchListener', 'Generate flow calculations during the given time', {
        numberSensors: {
            description: 'number of sensors detecting at the same time',
            alias: 'n',
            type: 'number',
        },
        minutes: {
            description: 'minutes of execution',
            alias: 'm',
            type: 'number',
        },
        frequency: {
            description: 'frequency of calculation in seconds',
            alias: 'f',
            type: 'number',
        },
        timeData: {
            description: 'number of seconds to get the data from now',
            alias: 't',
            type: 'number',
        },
        prefix: {
            description: 'prefix for the csv to use',
            alias: 'p',
            type: 'string',
        },
        maxCalculationTime: {
            description: 'maximum time allowed for calculation',
            alias: 'maxc',
            type: 'number',
        },
        minCalculationTime: {
            description: 'minimum time allowed for calculation',
            alias: 'minc',
            type: 'number',
        },
        streetKilometers: {
            description: 'number of kilometers of the street',
            alias: 's',
            type: 'number',
        }
      }
    )
.help().alias('help', 'h').argv;

async function main(numberSensors, minutes, frequency, timeData, prefix, minimumTime, maximumTime, streetKilometers) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('admin');
        if (!identity) {
            console.log('An identity for the user "admin" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('street_network');

        let velocities = [];
        let timeStart = [];
        let inde = [];
        let initialTime = Date.now()

        csv().fromFile('./cars4.csv').then((res) => {
            for (let i = 0; i < res.length; i++){
                velocities.push(res[i].VELOCITY);
                timeStart.push(res[i].TIME_START);
                inde.push(i); 
            }
        });

        let csvBody = "";
        let csvBodyCalculated = "";
        let resultFile = "./results/" + prefix + "_" + new Date().toLocaleDateString().replace("/","_").replace("/","_")+".csv";
        fs.readFile(resultFile, (err, data) => {
            if(err){
                csvBody = "NUMBER_SENSORS,NUMBER_DETECTIONS,TOTAL_TIME,CARS_PER_SECOND_BY_SENSOR,CARS_PER_SECOND_TOTAL,REAL_CARS_PER_SECOND,REAL_CARS_PER_SECOND_TOTAL,FREQUENCY,TIME_DATA,FREQUENCY_DATA,DETECTIONS_STORED,FROM_DATE,TO_DATE,MINIMUM_TIME,MAXIMUM_TIME\n";
            }else{
                csvBody = data;
            }
        });
        let resultCalculatedFile = "./results/" + prefix + "_results_" + new Date().toLocaleDateString().replace("/","_").replace("/","_")+".csv";
        fs.readFile(resultCalculatedFile, (err, data) => {
            if(err){
                csvBodyCalculated = "NUMBER_SENSORS,FREQUENCY,TIME_DATA,MIN_TIME,MAX_TIME,AVG_TIME,STD_TIME,SUCCESFUL_CALCULATIONS,CALCULATIONS_OVER_MAX\n";
            }else{
                csvBodyCalculated = data;
            }
        });
        let execTimes = [];
        let calculationDates = [];
        let fromDate = Date.now();
        let count = 0;
        let countCalculationsOverMax = 0;

        const listener = await contract.addContractListener((event) => {

            event = event.payload.toString();
            event = JSON.parse(event); 

            if (event.type === 'calculateFlow'){

                let totalInstant = 0;
                let totalTimeData = 0;
                timeData = event.timeData;

                for(let j = 0; j< event.totalDetections.length; j++){
                    let before_instant = []
                    let before_timeData = []
                    let after = []
                    let d = Date.now()
                    for (let i = 0; i < inde.length; i++) {
                         after.push(velocities[i] * (d - initialTime - timeStart[i])/3600);
                         before_instant.push(velocities[i] * (d - initialTime - 1000 - timeStart[i])/3600);
                         if(((d - initialTime - (timeData*1000)) < timeStart[i]) && timeStart[i] < d - initialTime){
                            before_timeData.push(velocities[i] * (d - initialTime - (timeData*1000) - timeStart[i])/3600);
                         }
                    };
                    for (let i = 0; i < before_instant.length; i++) {
                        if((before_instant[i] >= 0 || after[i] >= 0) && before_instant[i] < 1000*streetKilometers){
                            if(before_instant[i] <= 0){
                                if(after[i] >= 1000*streetKilometers){
                                    totalInstant+= 1000;
                                }else{
                                    totalInstant+= after[i];
                                }
                
                            }else{
                                totalInstant+= after[i] -before_instant[i];
                            }
                    
                        }      
                        
                    }
                    for (let i = 0; i < before_timeData.length; i++) {
                        if((before_timeData[i] >= 0 || after[i] >= 0) && before_timeData[i] < 1000*streetKilometers){
                            if(before_timeData[i] <= 0){
                                if(after[i] >= 1000*streetKilometers){
                                    totalTimeData+= 1000*streetKilometers;
                                }else{
                                    totalTimeData+= after[i];
                                }
                
                            }else{
                                totalTimeData+= after[i] - before_timeData[i];
                            }
                    
                        }      
                    
                    }

                    if(maximumTime*1.5 < event.execDuration){
                        countCalculationsOverMax++;
                    }

                    console.log('A flow has beeen calculated with a total number of '+ event.totalDetections[j] + ' detections and a duration of ' + event.execDuration + ' ms');
                    csvBody += `${numberSensors},${event.totalDetections[j]},${event.execDuration},[${event.carsPerSecondSection[j].toString().replace(/,/g,";")}],${event.carsPerSecondTotal[j]},${totalInstant/(1000*streetKilometers)},${totalTimeData/(1000*timeData*streetKilometers)},${frequency},${event.timeData},${event.frequencyData},${event.totalDetectionsStoredList[j]},${event.fromDates[j]},${event.fromDates[j] - (1000*event.timeData)},${minimumTime},${maximumTime}\n`;
                    totalInstant = 0;
                    totalTimeData = 0;
                }

                console.log(`CalculateFlow event detected, waiting ${frequency} seconds to launch transaction`);
                if(event.execDuration > 0){
                    execTimes.push(event.execDuration);
                }


            }else if (event.type === 'detection'){

                setTimeout(() => {
                    count++;

                    if(count == numberSensors){
                        console.log("Launching calculateFlow transaction");
                        calculateFlow(event.timeData, JSON.stringify(calculationDates), numberSensors, event.frequency);
                        calculationDates = [];
                        count = 0;
                    }                  
                }, event.numberSensor*10);
         
            }   
           
        });


        let intervalCalculate = setInterval(() => {
            
            calculationDates.push(fromDate);
            fromDate += frequency*1000;
        }, frequency*1000);


        setTimeout(() => {
            clearInterval(intervalCalculate);
        }, minutes*1000 + 500);

        setTimeout(() => {
            contract.removeContractListener(listener);
            fs.writeFileSync(resultFile, csvBody,'utf8');
            gateway.disconnect();
            let min = execTimes.reduce((a,b)=> {
                if(b<a){
                    return b
                }else{
                    return a
                }
            });
            let max = execTimes.reduce((a,b)=> {
                if(b>a){
                    return b
                }else{
                    return a
                }
            });
            let avg = execTimes.reduce((a,b)=> {
                return a+b;
            })/execTimes.length;
            let stdev = execTimes.map((a) => {
                return ((a - avg)**2)/execTimes.length;
            })
            .reduce((a,b)=> {
                return a+b;
            });
            csvBodyCalculated += `${numberSensors},${frequency},${timeData},${min},${max},${avg},${Math.sqrt(stdev)},${execTimes.length},${countCalculationsOverMax}\n`;
            fs.writeFileSync(resultCalculatedFile, csvBodyCalculated,'utf8');
            return true;
        }, minutes*1000 + 10000);


        


    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

if (argv._.includes('launchListener')) {
    main(argv.numberSensors, argv.minutes, argv.frequency, argv.timeData, argv.prefix, argv.minCalculationTime, argv.maxCalculationTime, argv.streetKilometers);
}

async function calculateFlow(timeData, fromDate, numberSensors, frequency) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('admin');
        if (!identity) {
            console.log('An identity for the user "admin" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('street_network');

        const result = await contract.evaluateTransaction('queryStreetFlows', 1);


        // Submit the specified transaction.
        await contract.submitTransaction('calculateFlowV2', result.toString(), timeData, fromDate, numberSensors, frequency);

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}