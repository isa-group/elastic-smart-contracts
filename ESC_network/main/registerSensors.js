/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const yargs = require('yargs');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');

const argv = yargs
    .command('registerSensors', 'Register a number of sensors', {
        numberSensors: {
            description: 'number of sensors to register',
            alias: 'n',
            type: 'number',
        }
      }
    )
.help().alias('help', 'h').argv; 

async function main(numberSensors) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'base-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
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
        const contract = network.getContract('ESC_network');

        for(let i =1; i<=numberSensors; i++){
            setTimeout(() => {
                if(i == numberSensors){
                    contract.submitTransaction('createSensor', i).then((res) => {
                        process.exit();
                    });
                }else{
                    contract.submitTransaction('createSensor', i);
                }

            }, 100*i);
        }
        await contract.submitTransaction('createStreetFlows', 1);


    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

if (argv._.includes('registerSensors')) {



    main(argv.numberSensors);
}
