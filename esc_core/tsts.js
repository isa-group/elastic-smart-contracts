
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');

async function main(){
    const ccpPath = path.resolve(__dirname,   '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
console.log(`ccpPath path: ${ccpPath}`)
// Create a new file system based wallet for managing identities.
const walletPath = path.join(process.cwd()+'/', 'wallet');
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
const network = await gateway.getNetwork('escchannel');
let contract = network.getContract('governify');
//Hacer evaluateTransaction en vez del submit para hacer queries, el submit es mas para escribir
var result = await contract.evaluateTransaction('queryData',1);
console.log(result.toString())
}
main()
