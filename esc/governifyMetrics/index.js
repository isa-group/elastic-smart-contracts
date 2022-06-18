
var ESC = require("../../esc_core");
const yargs = require('yargs');
const JSONStream = require('JSONStream');
const governify = require('governify-commons');
const logger = governify.getLogger().tag('index');
const diff = require('deep-diff');

let config = {
  conexionPath: "./network/organizations/peerOrganizations/org1.example.com/connection-org1.json",
  resultsPath: "./experiments_results/30/governifyMetrics/",
  identityName: "admin",
  channelName: "escchannel",
  chaincodeName: "governifyMetrics",
  csvResultsCalculationsHeader: "RESPONSES,TOTAL_TIME,FREQUENCY,TIME_DATA,FREQUENCY_DATA,RESPONSES_STORED,FROM_DATE,TO_DATE,MINIMUM_TIME,MAXIMUM_TIME,CURRENT_ESC_RUNNING\n",
  csvResultsExperimentHeader: "FREQUENCY,TIME_DATA,MIN_TIME,MAX_TIME,AVG_TIME,STD_TIME,SUCCESFUL_CALCULATIONS,CALCULATIONS_OVER_MAX\n",


  executionTime: 5000,
  analysisFrequency: 15,
  harvestFrequency: 16,
  dataTimeLimit: 6000,
  frequencyControlCalculate: 1,
  maximumTimeAnalysis: 2600,
  minimumTimeAnalysis: 2590,
  elasticityMode: "noElasticity",
  experimentName: "test",
    
  updateDataContract: "updateData",
  evaluateWindowTimeContract: "evaluateHistory",
  evaluateHarvestFrequencyContract: "evaluateFrequency",
  queryAnalysisHolderContract: "queryDataCalculation",
  analysisHolderId: 2,
  analysisContract: "analysis",
  dataStorageContract: "createData",
  calculationStorageContract: "createDataCalculation",



}

const argv = yargs
  .command('start', 'start the esc', {
    }
  )
.help().alias('help', 'h').argv; 

function start(){

  ESC.configurate(config,config.chaincodeName)
  
  ESC.connect(config.chaincodeName)

}



module.exports.config = config;
module.exports.chaincodeName = function(){
  console.log(config.chaincodeName)
};
module.exports.start = start;
module.exports.stop = stop;
module.exports.getIntervals= function() {
  return [interval,timeout];
};