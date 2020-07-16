/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const yargs = require('yargs');
const { Gateway, Wallets, } = require('fabric-network');
const fs = require('fs');
const path = require('path');

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
        }
      }
    )
.help().alias('help', 'h').argv;

async function main(numberSensors, minutes, frequency, timeData, prefix) {
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

        let ignoreEvent = true;

        let csvBody = "";
        let csvBodyCalculated = "";
        let resultFile = "./results/" + prefix + "_" + new Date().toLocaleDateString().replace("/","_").replace("/","_")+".csv";
        fs.readFile(resultFile, (err, data) => {
            if(err){
                csvBody = "NUMBER_SENSORS,NUMBER_DETECTIONS,TOTAL_TIME,CARS_PER_SECOND_BY_SENSOR,CARS_PER_SECOND_TOTAL,FREQUENCY,TIME_DATA\n";
            }else{
                csvBody = data;
            }
        });
        let resultCalculatedFile = "./results/" + prefix + "_results_" + new Date().toLocaleDateString().replace("/","_").replace("/","_")+".csv";
        fs.readFile(resultCalculatedFile, (err, data) => {
            if(err){
                csvBodyCalculated = "NUMBER_SENSORS,FREQUENCY,TIME_DATA,MIN_TIME,MAX_TIME,AVG_TIME,STD_TIME,SUCCESFUL_CALCULATIONS\n";
            }else{
                csvBodyCalculated = data;
            }
        });
        let execTimes = [];

        const listener = await contract.addContractListener((event) => {

            if(!ignoreEvent){
                event = event.payload.toString();
                event = JSON.parse(event); 

                if (event.type === 'calculateFlow'){
                    console.log('A flow has beeen calculated with a total number of '+ event.totalDetections + ' detections');
                    console.log(`CalculateFlow event detected, waiting ${frequency} seconds to launch transaction`);
                    csvBody += `${numberSensors},${event.totalDetections},${event.execDuration},[${event.carsPerSecondSection.toString().replace(/,/g,";")}],${event.carsPerSecondTotal},${frequency},${timeData}\n`;
                    execTimes.push(event.execDuration);

                }
            }
           
        });

        let fromDate = 1594914979279;

        let intervalCalculate = setInterval(() => {
            ignoreEvent = false;
            
            console.log("Launching calculateFlow transaction");
            calculateFlow(timeData, fromDate, numberSensors);
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
            csvBodyCalculated += `${numberSensors},${frequency},${timeData},${min},${max},${avg},${Math.sqrt(stdev)},${execTimes.length}\n`;
            fs.writeFileSync(resultCalculatedFile, csvBodyCalculated,'utf8');
            return true;
        }, minutes*1000 + 10000);


        


    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

if (argv._.includes('launchListener')) {
    main(argv.numberSensors, argv.minutes, argv.frequency, argv.timeData, argv.prefix);
}

async function calculateFlow(timeData, fromDate, numberSensors) {
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

        const result = await contract.evaluateTransaction('queryAllFlows');


        // Submit the specified transaction.
        await contract.submitTransaction('calculateFlowV2', 'CARFLOW'+ JSON.parse(result.toString()).length, 1, fromDate - (1000* timeData), fromDate, numberSensors);

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}