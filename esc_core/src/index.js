/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');
const FabricCAServices = require('fabric-ca-client');

const dir = './esc/'
var paths = [];
var chaincodes = [];
var dataStorageContracts = [];
var calculationStorageContracts = [];
//var numberStoragesList = [];


let pro = new Promise((res,rej) => {
    fs.readdir(dir,(err,files) => {
   
        paths= paths.concat(files.filter((path)=> {
           return path != 'esc';
        }))
        res(true)   
    })
})
    
enrollAdmin().then(()=>{
    pro.then(()=>{
        for(let i = 0; i<paths.length; i++){
            console.log(paths)
            let a = require('../../esc/'+paths[i])
    
            chaincodes.push(a.config.chaincodeName);
            dataStorageContracts.push(a.config.dataStorageContract);
            calculationStorageContracts.push(a.config.calculationStorageContract);
    
        }
        main(chaincodes,dataStorageContracts,calculationStorageContracts);
    });
});



async function main(chaincodes,dataStorageContracts,calculationStorageContracts) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..',  '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

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

async function enrollAdmin() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..',  '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd()+'/esc_core/', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get('admin');
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}








