
var ESC = require("../../esc_core");
const csv = require('csvtojson');
const yargs = require('yargs');

let config = {
  conexionPath: "./network/organizations/peerOrganizations/org1.example.com/connection-org1.json",
  resultsPath: "./esc-template/results",
  identityName: "admin",
  channelName: "escchannel",
  chaincodeName: "analytics_chaincode",
  csvResultsCalculationsHeader: "NUMBER_DETECTIONS,TOTAL_TIME,FREQUENCY,TIME_DATA,FREQUENCY_DATA,DETECTIONS_STORED,FROM_DATE,TO_DATE,MINIMUM_TIME,MAXIMUM_TIME,CARS_PER_SECOND_BY_SENSOR,CARS_PER_SECOND_TOTAL\n",
  csvResultsExperimentHeader: "FREQUENCY,TIME_DATA,MIN_TIME,MAX_TIME,AVG_TIME,STD_TIME,SUCCESFUL_CALCULATIONS,CALCULATIONS_OVER_MAX\n",
  csvResultsHarvestHeader: "INIT_TIME,FINAL_TIME,TOTAL_TIME,INIT_UPDATE_TIME,FINAL_UPDATE_TIME,TOTAL_UPDATE_TIME,COLLECTOR_TIME,\n",

  executionTime: 60,
  analysisFrequency: 5,
  harvestFrequency: 1,
  analysisStartDelay: 15,
  harvestStartDelay: 0,
  dataTimeLimit: 30,
  frequencyControlCalculate: 5,
  maximumTimeAnalysis: 100,
  minimumTimeAnalysis: 50,
  elasticityMode: "timeWindow",
  experimentName: "test",
  coldStart: false,
  numberOfESCs: 1,
  dataPerHarvest: 1,
  analysisRetryTime: 500,
  numberOfTimesForAnalysisAvg: 5,
    
  updateDataContract: "updateData",
  evaluateHistoryContract: "evaluateHistory",
  evaluateFrequencyContract: "evaluateFrequency",
  queryAnalysisHolderContract: "queryAnalysis",
  analysisHolderId: 1,
  analysisContract: "analysis",
  dataStorageContract: "createSensor",
  calculationStorageContract: "calculationStorage",



}

let harvesterHookParams = {
  // hook params
}

let analyserParams = {
 // analyser params
}



// New data to be introduced, define here how the data is collected 
function hookData(){
  let newData = {}
  return newData;
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
 * @param {number} frequency - The initial frequency in seconds to harvest data.
 */
async function intervalHarvester(frequency) {

  if(config.elasticityMode === "harvestFrequency"){
    ESC.frequencyChanged();
    let interval = await setInterval(() => {
  
      ESC.getNewFrequency().then((res) =>{
  
        if(res.change){
  
          clearInterval(interval);

          if(!stop){
            intervalHarvester(res.newFrequency)
          }
          
  
        }else{
  
          let newData = hookData();
  
          ESC.harvesterHook(harvesterHookParams, newData);
        }
      })
      
    }, frequency*1000);
  }else{
    let interval = await setInterval(() => {
    
      let newData = hookData();
  
      ESC.harvesterHook(harvesterHookParams, newData);
  
    }, frequency*1000);
  
    setTimeout(() => {
      clearInterval(interval);
      console.log("************** EXECUTION COMPLETED, SHUTING DOWN ********************")
    }, config.executionTime*1000 + 100);
  }

}

if (argv._.includes('start')) {

  ESC.configurate(config)

  var stop = false;
  var initialTime = Date.now()
  
  
  ESC.connect().then(() =>{
  
  
    ESC.analyser(analyserParams);
  
    ESC.harvesterListener();
  
  
  
    intervalHarvester(config.harvestFrequency);

    if(config.elasticityMode === "harvestFrequency") {
      setTimeout(() => {
        stop = true;
        console.log("************** EXECUTION COMPLETED, SHUTING DOWN ********************")
      }, config.executionTime*1000 + 100);
    }
    
  
  })

}



module.exports.config = config;
module.exports.chaincodeName = function(){
  console.log(config.chaincodeName)
};