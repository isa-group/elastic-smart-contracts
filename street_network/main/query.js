/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const csv = require('csvtojson');


async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

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


        // Evaluate the specified transaction.
        //const result = await contract.evaluateTransaction('queryAllDetections');
        //const result = await contract.evaluateTransaction('queryAllFlows');
        //const result = await contract.evaluateTransaction('queryCalculate', 0, 999999999999999999999,1);
        //const result = await contract.evaluateTransaction('querySensor' ,1);

        //const result = await contract.evaluateTransaction('querySensor', 1);
        //const result = await contract.submitTransaction('orquestator', 4, 1, 100, 1, 1800, 100, 50,5, 1, 8);
        //contract.submitTransaction('createSensor', 1);
        //calculateFlowV2(ctx, streetFlow, timeData, fromDates, numberSensors)
        const result = await contract.evaluateTransaction('requestTest');
       //contract.submitTransaction('calculateFlowV2', result.toString(),32, JSON.stringify(a),  4);
        //contract.submitTransaction('bucle', 1, [23], 100, 1);
        //createDetectionSensor(ctx, numberSensor, sensorKilometer, direction, numberCars)

        let detections = JSON.parse(result.toString());

        //console.log(`Transaction has been evaluated, result is: ${JSON.parse(result.toString()).length}`);
        console.log(detections);

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
