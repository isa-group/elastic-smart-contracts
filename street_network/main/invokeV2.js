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
    .command('launchDetections', 'Generate detections during the given time', {
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
        streetKilometers: {
            description: 'number of kilometers of the street',
            alias: 's',
            type: 'number',
        },
        numberSensor: {
            description: 'number of the sensor',
            alias: 'j',
            type: 'number',
        },
        dataFrequency: {
            description: 'frequency to insert data by sensors in seconds',
            alias: 'd',
            type: 'number',
        },
        timeData: {
            description: 'number of seconds to get the data from now',
            alias: 't',
            type: 'number',
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
        frequencyControlCalculate: {
            description: 'frequency to control the calculate time',
            alias: 'fcc',
            type: 'number',
        },
        experimentNumber: {
            description: 'experiment to execute',
            alias: 'e',
            type: 'number',
        }
      }
    )
.help().alias('help', 'h').argv;


async function main(numberSensor, numberSensors, streetKilometers, minutes, dataFrequency, timeData, maxCalculationTime, minCalculationTime, frequencyControlCalculate, experimentNumber) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('sensor'+ numberSensor);
        if (!identity) {
            console.log(`An identity for the user "sensor${numberSensor}" does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'sensor'+ numberSensor, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('street_network');

        let velocities = [];
        let timeStart = [];
        let inde = []
        await csv().fromFile('./cars4.csv').then((res) => {
            for (let i = 0; i < res.length; i++){
                velocities.push(res[i].VELOCITY);
                timeStart.push(res[i].TIME_START);
                inde.push(i);
            }
        });

        let initialTime = Date.now();

        let detections = [];
        let flowCommited = true;
        let warmUp = true;
        let controlCount = 0;
        let avgExecTime = 0;

        if(experimentNumber == 2){
            setTimeout(() => {
                maxCalculationTime = maxCalculationTime/2;
                minCalculationTime = minCalculationTime/2;
            }, 1200000);
        }

        var interval = await setInterval(() => {

            if( detections.length >= 5 && flowCommited){
                let totalBeginHR = process.hrtime();
                let totalBegin = totalBeginHR[0] * 1000000 + totalBeginHR[1] / 1000;
                flowCommited = false;
                let submit = detections;
                detections = [];
    
                contract.submitTransaction('createDetectionSensor', numberSensor, JSON.stringify(submit), timeData).then(() => {
                    let totalEndHR = process.hrtime()
                    let totalEnd = totalEndHR[0] * 1000000 + totalEndHR[1] / 1000;
                    let totalDuration = (totalEnd - totalBegin) / 1000;
    
                console.log('Transaction has been submitted with an execution time of '+ totalDuration + ' ms');
                });
            }else{
                let detection = {
                    detectionDateTime: Date.now(),
                    numberCars: inde.filter((i) => {
                        return (velocities[i] * (Date.now() - initialTime - timeStart[i])/3600000) >= (streetKilometers*numberSensor)/numberSensors &&
                         (velocities[i] * (Date.now() - initialTime - 1000 - timeStart[i])/3600000) < (streetKilometers*numberSensor)/numberSensors;
                    }).length,
                    sensorKilometer: (streetKilometers*numberSensor)/numberSensors,
                    direction: 'ASCENDENT',
                };
                detections.push(detection);
            }
        }, dataFrequency*1000);


        const listener = await contract.addContractListener((event) => {

            event = event.payload.toString();
            event = JSON.parse(event); 

            if (event.type === 'calculateFlow'){
                flowCommited = true;
                if(warmUp){

                    avgExecTime += event.execDuration/frequencyControlCalculate;
                    controlCount++;

                    if(avgExecTime > minCalculationTime){

                        warmUp = false;
                        
                    }else if(controlCount >= frequencyControlCalculate){
                        controlCount = 0;
                        avgExecTime = 0;
                    }

                }else if(!warmUp && controlCount >= frequencyControlCalculate && experimentNumber < 3){

                    avgExecTime += event.execDuration/frequencyControlCalculate;
                    
                    contract.submitTransaction('monitorTime', timeData, avgExecTime, maxCalculationTime, minCalculationTime).then((res) => {
                        let newTime = JSON.parse(res.toString());
                        if(newTime < 32){
                            newTime = 32;
                        }else if (newTime > 65536){
                            newTime = 65536;
                        }

                        if(newTime > 0 && newTime != timeData){
                            timeData = newTime;
                            console.log("New Time Data: " + timeData)
                        }
                    });
                    controlCount = 0;
                    avgExecTime = 0;
                }else if(!warmUp && controlCount >= frequencyControlCalculate && experimentNumber >= 3){
                    avgExecTime += event.execDuration/frequencyControlCalculate;
                    
                    contract.submitTransaction('monitorFrequency', dataFrequency, avgExecTime, maxCalculationTime, minCalculationTime).then((res) => {
                        let newTime = JSON.parse(res.toString());
                        if(newTime < 0.1){
                            newTime = 0.1;
                        }else if (newTime > 60){
                            newTime = 60;
                        }

                        if(newTime > 0 && newTime != dataFrequency){
                            clearInterval(interval);
                            dataFrequency = newTime;
                            console.log("New Sensor Frequency: " + dataFrequency)
                            interval = setInterval(() => {

                                if( detections.length >= 5 && flowCommited){
                                    let totalBeginHR = process.hrtime();
                                    let totalBegin = totalBeginHR[0] * 1000000 + totalBeginHR[1] / 1000;
                                    flowCommited = false;
                                    let submit = detections;
                                    detections = [];
                        
                                    contract.submitTransaction('createDetectionSensor', numberSensor, JSON.stringify(submit), timeData).then(() => {
                                        let totalEndHR = process.hrtime()
                                        let totalEnd = totalEndHR[0] * 1000000 + totalEndHR[1] / 1000;
                                        let totalDuration = (totalEnd - totalBegin) / 1000;
                        
                                    console.log('Transaction has been submitted with an execution time of '+ totalDuration + ' ms');
                                    });
                                }else{
                                    let detection = {
                                        detectionDateTime: Date.now(),
                                        numberCars: inde.filter((i) => {
                                            return (velocities[i] * (Date.now() - initialTime - timeStart[i])/3600000) >= (streetKilometers*numberSensor)/numberSensors &&
                                             (velocities[i] * (Date.now() - initialTime - 1000 - timeStart[i])/3600000) < (streetKilometers*numberSensor)/numberSensors;
                                        }).length,
                                        sensorKilometer: (streetKilometers*numberSensor)/numberSensors,
                                        direction: 'ASCENDENT',
                                    };
                                    detections.push(detection);
                                }
                            }, dataFrequency*1000);
                        }
                    });
                    controlCount = 0;
                    avgExecTime = 0;
                }else if(!warmUp && controlCount < frequencyControlCalculate){
                    controlCount++;
                    avgExecTime += event.execDuration/frequencyControlCalculate;
                }
            }         
        });
        
        setTimeout(() => {
            clearInterval(interval);
            contract.removeContractListener(listener);
            setTimeout(() => {
                gateway.disconnect();
                console.log("Disconnected " + dataFrequency);


            }, 5000);
        }, minutes*1000 + 100);


    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}


if (argv._.includes('launchDetections')) {



    main(argv.numberSensor, argv.numberSensors, argv.streetKilometers, argv.minutes, argv.dataFrequency, argv.timeData,
         argv.maxCalculationTime, argv.minCalculationTime, argv.frequencyControlCalculate, argv.experimentNumber);

}

