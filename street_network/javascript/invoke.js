/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets, } = require('fabric-network');
const fs = require('fs');
const path = require('path');


async function main() {
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

        // Submit the specified transaction.
        // 
        

        const time = await Date.now();
        //await contract.submitTransaction('calculateFlow', 'CARFLOW1', 2, "ASCENDENT", 7, 7, 1588698495684);
        await contract.submitTransaction('createDetection', 1, 'DETECTION' + Math.floor(Math.random() *1000), 1, 1, 1, 'ascendent');

        
        console.log('Transaction has been submitted with an execution time of '+ (Date.now() - time)/1000 + ' seconds');


        //await contract.removeContractListener(listener);

        // Disconnect from the gateway.
        //await contract.removeContractListener(listener);
        await gateway.disconnect();
        await console.log("Disconnected")

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();

async function wait() {
    let promise = new Promise ((res, rej) => {
        setTimeout(() => res("caracola"), 3000);
    });
    let result = await promise;
    return result;

}