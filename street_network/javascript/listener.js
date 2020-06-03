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
        }
      }
    )
.help().alias('help', 'h').argv;

async function main(numberSensors, minutes, frequency, timeData) {
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
        //const result = await contract.evaluateTransaction('queryAllDetections');
        let csvBody = "NUMBER_SENSORS,NUMBER_DETECTIONS,TOTAL_TIME\n";

        const listener = await contract.addContractListener((event) => {

            event = event.payload.toString();
            event = JSON.parse(event)
            

                if (event.type === 'calculateFlow'){
                    console.log('A flow has beeen calculated with a total number of '+ event.numberDetections + ' detections');
                    console.log("CalculateFlow event detected, waiting 10 seconds to launch transaction");
                    csvBody += `${numberSensors},${event.numberDetections},${event.execDuration}\n`;
                    setTimeout(() => {
                        const fromDate =  Date.now();
                        console.log("Launching calculateFlow transaction");
                        calculateFlow(timeData, fromDate);
                    }, frequency*1000); 

                }
   
           
        });

        await calculateFlow(timeData, Date.now())

        setTimeout(() => {
            contract.removeContractListener(listener);
            let datasetFile = "./results/" +new Date().toLocaleDateString().replace("/","_").replace("/","_")+".csv";
            fs.writeFileSync(datasetFile, csvBody,'utf8');
            gateway.disconnect();

        }, minutes*60000 + 3000);


        


    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

if (argv._.includes('launchListener')) {
    if(!fs.existsSync("./results")){
        fs.mkdirSync("./results");
    }
    main(argv.numberSensors, argv.minutes, argv.frequency, argv.timeData);
}

async function calculateFlow(timeData, fromDate) {
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

        //const result = await contract.evaluateTransaction('queryCalculate', time - (1000* timeData), time);

        // Submit the specified transaction.
        await contract.submitTransaction('calculateFlow', 'CARFLOW'+ JSON.parse(result.toString()).length, 1, fromDate - (1000* timeData));
        //console.log('Transaction has been submitted');


        //await contract.removeContractListener(listener);

        // Disconnect from the gateway.
        //await contract.removeContractListener(listener);
        await gateway.disconnect();
        //await console.log("Disconnected")

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}