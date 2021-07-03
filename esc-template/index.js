
var ESC = require("../../esc_core");
const csv = require('csvtojson');
const yargs = require('yargs');

let config = {
  conexionPath: "../../network/organizations/peerOrganizations/org1.example.com/connection-org1.json",
  resultsPath: "./results",
  identityName: "admin",
  channelName: "escchannel",
  chaincodeName: "analytics_chaincode",
  csvResultsCalculationsHeader: "NUMBER_DETECTIONS,TOTAL_TIME,FREQUENCY,TIME_DATA,FREQUENCY_DATA,DETECTIONS_STORED,FROM_DATE,TO_DATE,MINIMUM_TIME,MAXIMUM_TIME,CARS_PER_SECOND_BY_SENSOR,CARS_PER_SECOND_TOTAL\n",
  csvResultsExperimentHeader: "FREQUENCY,TIME_DATA,MIN_TIME,MAX_TIME,AVG_TIME,STD_TIME,SUCCESFUL_CALCULATIONS,CALCULATIONS_OVER_MAX\n",


  executionTime: 60,
  analysisFrequency: 5,
  harvestFrequency: 1,
  dataTimeLimit: 30,
  frequencyControlCalculate: 5,
  maximumTimeAnalysis: 100,
  minimumTimeAnalysis: 50,
  experimentNumber: 2,
  experimentName: "test2",
    
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

const argv = yargs
  .command('start', 'start the esc', {
    }
  )
.help().alias('help', 'h').argv; 



/**
 * Call the harvester in esc_core/index regularly with the frequency given and in case of having an elastic frequency it monitors any changes in it and applies it. 
 * 
 * In this function it is defined from where the data is taken to introduce it in the blockchain.
 * @function
 * @param {number} frequency - The initial frequency in seconds to harvest data.
 */
async function intervalHarvester(frequency) {

 /** HARVEST HOOK */

}






if (argv._.includes('start')) {

  ESC.configurate(config)

  var stop = false;
  var initialTime = Date.now()
  
  
  ESC.connect().then(() =>{
  
  
    ESC.analyser(analyserParams);
  
    ESC.harvesterListener();
  
  
  
    intervalHarvester(config.harvestFrequency);
    
  
  })

}

module.exports.config = config;
module.exports.chaincodeName = function(){
  console.log(config.chaincodeName)
};