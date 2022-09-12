
var ESC = require("../../esc_core");
const csv = require('csvtojson');
const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');


let config = {
  conexionPath: "./network/organizations/peerOrganizations/org1.example.com/connection-org1.json",
  identityName: "admin",
  channelName: "escchannel",
  chaincodeNames: ["street1","street2"],
  queryStorages: ["queryStreetFlows","queryStreetFlows"],


  executionTime: 60,

  jamThreshold: 1,
  jamFactor: 1.5,
  emptyThreshold: 0.5,
  emptyFactor: 1.5,



}

const argv = yargs
  .command('start', 'start the esc', {
    }
  )
.help().alias('help', 'h').argv; 

async function averagesAnalysis() {
  try {
    // load the network configuration
    let ccp = JSON.parse(fs.readFileSync(config.conexionPath, 'utf8'));

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd()+'/esc_core/wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(config.identityName);
    if (!identity) {
        console.log(`An identity for the user "${config.identityName}" does not exist in the wallet`);
        console.log('Run the registerUser.js application before retrying');
        return;
    }

    // Create a new gateway for connecting to our peer node.
    gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: config.identityName, discovery: { enabled: true, asLocalhost: true } });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(config.channelName);

    let contractAnalysis =  network.getContract('intersection');
    let data = [];
    let count = 0;
    let params = {
      jamThreshold: config.jamThreshold,
      jamFactor: config.jamFactor,
      emptyThreshold: config.emptyThreshold,
      emptyFactor: config.emptyFactor,
    }

    for(i in config.chaincodeNames){
      let contract =  network.getContract(config.chaincodeNames[i]);

      let listener = await contract.addContractListener((event) => {

        event = event.payload.toString();
        event = JSON.parse(event); 

      if (event.type === 'analysis'){
          contract.evaluateTransaction(config.queryStorages[i], 1).then((res)=> {
            count++;
            data = data.concat(JSON.parse(res.toString())[0].Record.data);
            if(count >= config.chaincodeNames.length){
              count=0;

              if(data.length>0){
                params.average = (data.reduce((a,b)=> a +b.carsPerSecond.total,0)/data.length).toString();
                contractAnalysis.submitTransaction('addAverage', JSON.stringify(params));

              }else{
                params.average = "0";
                contractAnalysis.submitTransaction('addAverage', JSON.stringify(params));
              }
              setTimeout(() => {         
                data=[];
              }, 100);
            }
          });

        }
      })
      setTimeout(() => {
        contract.removeContractListener(listener);
      }, config.executionTime*1000);
    }
      
  } catch (error) {
      console.error(`Failed to submit transaction: ${error}`);
      process.exit(1);
  }
}

async function query() {
  try {
    // load the network configuration
    let ccp = JSON.parse(fs.readFileSync(config.conexionPath, 'utf8'));

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd()+'/esc_core/wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(config.identityName);
    if (!identity) {
        console.log(`An identity for the user "${config.identityName}" does not exist in the wallet`);
        console.log('Run the registerUser.js application before retrying');
        return;
    }

    // Create a new gateway for connecting to our peer node.
    gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: config.identityName, discovery: { enabled: true, asLocalhost: true } });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(config.channelName);

    let contractAnalysis =  network.getContract('intersection');
    
    let result = await contractAnalysis.evaluateTransaction('queryAveragesStorage');

    console.log(JSON.parse(result.toString())[0].Record)
 
      
  } catch (error) {
      console.error(`Failed to submit transaction: ${error}`);
      process.exit(1);
  }
}

if (argv._.includes('start')) {
  averagesAnalysis();
}
if (argv._.includes('query')) {
  query();
}
module.exports.config = config;
module.exports.chaincodeName = function(){
  console.log("intersection")
};

