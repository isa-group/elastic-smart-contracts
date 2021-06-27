/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');

const dir = './esc/'
var paths = [];
var chaincodes = [];
var dataStorageContracts = [];
var calculationStorageContracts = [];

let analysis = false;
let pro = new Promise((res,rej) => {
    fs.readdir(dir,(err,files) => {
        analysis= files.includes('analysis')
        paths= paths.concat(files.filter((path)=> {
           return (path != 'esc' && path != 'analysis');
        }))
        res(true)   
    })
})
    
pro.then(()=>{
    for(let i = 0; i<paths.length; i++){
        console.log(paths)
        let a = require('../../esc/'+paths[i])

        chaincodes.push(a.config.chaincodeName);
        dataStorageContracts.push(a.config.dataStorageContract);
        calculationStorageContracts.push(a.config.calculationStorageContract);

    }
    main(chaincodes,dataStorageContracts,calculationStorageContracts,analysis);
});



/**
 * Introduces the storage entities for each chaincode in the blockchain
 * @function
 * @param {array} chaincodes - The name of each chaincode to which create storage is contained in this array.
 * @param {array} dataStorageContracts - The names of the smart contracts that create each data storage for each chaincode.
 * @param {array} calculationStorageContracts - The names of the smart contracts that create each calculation storage for each chaincode.
 */
async function main(chaincodes,dataStorageContracts,calculationStorageContracts,analysis) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..',  '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        console.log(`ccpPath path: ${ccpPath}`)
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd()+'/esc_core/', 'wallet');
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
        const network = await gateway.getNetwork('governifychannel');

        // Get the contract from the network.
        if(analysis){
            let contract = network.getContract('analysis');
            await contract.submitTransaction('createStorage');
            console.log("Averages storage created")
        }
        

        for(let i =0; i<chaincodes.length; i++){
            let contract = network.getContract(chaincodes[i]);

      
            await contract.submitTransaction(dataStorageContracts[i]);
        
            
                
            await contract.submitTransaction(calculationStorageContracts[i]);
            console.log("Storage "+(i+1)+" of " +chaincodes.length + " added")

        }
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}








