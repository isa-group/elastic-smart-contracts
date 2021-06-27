
var ESC = require("../../esc_core");
const csv = require('csvtojson');
const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');


let config = {
  conexionPath: "/home/pablo/Escritorio/Gover/Elastic/network/organizations/peerOrganizations/org1.example.com/connection-org1.json",
  identityName: "admin",
  channelName: "governifychannel",
  chaincodeNames: ["governify","governify2"],
  


  executionTime: 60,



}

const argv = yargs
  .command('start', 'start the experiment', {
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

    let contractAnalysis =  network.getContract('analysis');
    let data = [];
    let count = 0;

    for(i in config.chaincodeNames){
      let contract =  network.getContract(config.chaincodeNames[i]);

      let listener = await contract.addContractListener((event) => {

        event = event.payload.toString();
        event = JSON.parse(event); 

      if (event.type === 'analysis'){
          contract.evaluateTransaction('queryStreetFlows', 1).then((res)=> {
            count++;
            data = data.concat(JSON.parse(res.toString())[0].Record.data);
            if(count >= config.chaincodeNames.length){
              count=0;
              if(data.length>0){
                contractAnalysis.submitTransaction('addAverage', (data.reduce((a,b)=> a +b.carsPerSecond.total,0)/data.length).toString())
              }else{
                contractAnalysis.submitTransaction('addAverage', "0")
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

    let contractAnalysis =  network.getContract('analysis');
    
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
  console.log("analysis")
};

