
var ESC = require("../../esc_core");
const csv = require('csvtojson');
const yargs = require('yargs');

const fs = require('fs');
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');

let config = {
  conexionPath: "./network/organizations/peerOrganizations/org1.example.com/connection-org1.json",
  resultsPath: "./esc/intersection/results",
  identityName: "admin",
  channelName: "escchannel",
  chaincodeName: "intersection",
  csvResultsCalculationsHeader: "NUMBER_DETECTIONS,TOTAL_TIME,FREQUENCY,TIME_DATA,FREQUENCY_DATA,DETECTIONS_STORED,FROM_DATE,TO_DATE,MINIMUM_TIME,MAXIMUM_TIME,CARS_PER_SECOND_BY_SENSOR,CARS_PER_SECOND_TOTAL\n",
  csvResultsExperimentHeader: "FREQUENCY,TIME_DATA,MIN_TIME,MAX_TIME,AVG_TIME,STD_TIME,SUCCESFUL_CALCULATIONS,CALCULATIONS_OVER_MAX\n",


  executionTime: 60,
  analysisFrequency: 5,
  harvestFrequency: 1,
  dataTimeLimit: 30,
  frequencyControlCalculate: 5,
  maximumTimeAnalysis: 100,
  minimumTimeAnalysis: 5,
  elasticityMode: 2,
  experimentName: "test2",
    
  updateDataContract: "addAverage",
  evaluateHistoryContract: "evaluateHistory",
  evaluateFrequencyContract: "evaluateFrequency",
  queryAnalysisHolderContract: "queryStorageAnalysis",
  queryDataStorageContract: "queryStorageData",
  analysisContract: "analysis",
  dataStorageContract: "createStorageData",
  calculationStorageContract: "createStorageAnalysis",

  chaincodeNames: ["street1","street2"],
  queryStorages: ["queryStreetFlows","queryStreetFlows"],

}

let harvesterHookParams = {

}

let analyserParams = {
  numberContracts: config.chaincodeNames.length,
  jamThreshold: config.jamThreshold,
  jamFactor: config.jamFactor,
  emptyThreshold: config.emptyThreshold,
  emptyFactor: config.emptyFactor,
}

const argv = yargs
    .command('start', 'start the esc', {
      }
    )
.help().alias('help', 'h').argv; 

/**
 * Call the harvester in esc_core/index regularly with the frequency given and in case of having an elastic frequency it monitors any changes in it and applies it. 
 * 
 * In this function it is defined from where and how the data is taken to introduce it in the blockchain.
 * @function
 */
async function intervalHarvester() {
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

    let data = [];
    let count = 0;


    for(i in config.chaincodeNames){
      let contract =  network.getContract(config.chaincodeNames[i]);

      let listener = await contract.addContractListener((event) => {

        event = event.payload.toString();
        event = JSON.parse(event); 
      if (event.type === 'analysis' && event.chaincode == config.chaincodeNames[i]){
          contract.evaluateTransaction(config.queryStorages[i], 1).then((res)=> {
            count++;
            
            data = data.concat(JSON.parse(res.toString())[0].Record.data);
            if(count >= config.chaincodeNames.length){
              count=0;

              if(data.length>0){
                ESC.harvesterHook(harvesterHookParams, (data.reduce((a,b)=> a +b.carsPerSecond.total,0)/data.length).toString());
              }else{
                ESC.harvesterHook(harvesterHookParams, "0");
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
        console.log("************** INTERSECTION COMPLETED, SHUTING DOWN ********************")
      }, config.executionTime*1000);
    }
      
  } catch (error) {
      console.error(`Failed to submit transaction: ${error}`);
      process.exit(1);
  }
 

}

if (argv._.includes('start') && config.elasticityMode != 3) {

  ESC.configurate(config)

  
  ESC.connect().then(() =>{
  
  
    ESC.analyser(analyserParams);
  
    ESC.harvesterListener();

    intervalHarvester();
  
  })

}
 
module.exports.config = config;
module.exports.chaincodeName = function(){
  console.log(config.chaincodeName)
};