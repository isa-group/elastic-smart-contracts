
var ESC = require("../../esc_core");
const csv = require('csvtojson');
const yargs = require('yargs');

let config = {
  conexionPath: "./network/organizations/peerOrganizations/org1.example.com/connection-org1.json",
  resultsPath: "./esc/street1/results",
  identityName: "admin",
  channelName: "escchannel",
  chaincodeName: "street1",
  csvResultsCalculationsHeader: "NUMBER_DETECTIONS,ANALYSIS_TIME,FREQUENCY,TIME_DATA,FREQUENCY_DATA,DETECTIONS_STORED,FROM_DATE,TO_DATE,MINIMUM_TIME,MAXIMUM_TIME\n",
  csvResultsExperimentHeader: "FREQUENCY,TIME_DATA,MIN_TIME,MAX_TIME,AVG_TIME,STD_TIME,SUCCESFUL_CALCULATIONS,CALCULATIONS_OVER_MAX\n",
  csvResultsHarvestHeader: "INIT_TIME,FINAL_TIME,TOTAL_TIME,INIT_UPDATE_TIME,FINAL_UPDATE_TIME,TOTAL_UPDATE_TIME,COLLECTOR_TIME,\n",

  executionTime: 100,
  analysisFrequency: 10,
  harvestFrequency: 10,
  analysisStartDelay: 10,
  harvestStartDelay: 0,
  dataTimeLimit: 30,
  frequencyControlCalculate: 5,
  maximumTimeAnalysis: 100,
  minimumTimeAnalysis: 50,
  elasticityMode: "timeWindow",
  experimentName: "test2",
  coldStart: false,
  numberOfESCs: 1,
  dataPerHarvest: 1,
  analysisRetryTime: 1000,
  numberOfTimesForAnalysisAvg: 1,
    
  updateDataContract: "updateData",
  evaluateWindowTimeContract: "evaluateWindowTime",
  evaluateHarvestFrequencyContract: "evaluateHarvestFrequency",
  queryAnalysisHolderContract: "queryStreetFlows",
  analysisHolderId: 1,
  analysisContract: "analysis",
  dataStorageContract: "createSensor",
  calculationStorageContract: "createStreetFlows",



}

let harvesterHookParams = {
  numberSensor: 1
}

let analyserParams = {
  numberSensors: 1,
  streetKilometers: 1
}

function hookData(){

  let newData = {
    detectionDateTime: Date.now(),
    numberCars: inde.filter((i) => {
        return (velocities[i] * (Date.now() - initialTime - timeStart[i])/3600000) >= 0.5 &&
         (velocities[i] * (Date.now() - initialTime - config.harvestFrequency*1000 - timeStart[i])/3600000) < 0.5;
    }).length,
    sensorKilometer: 0.5,
    direction: 'ASCENDENT',
  };

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

  if(config.elasticityMode == "harvestFrequency"){
    ESC.frequencyChanged(config.chaincodeName);
    let interval = setInterval(() => {
  
      ESC.getNewFrequency(config.chaincodeName).then((res) =>{
  
        if(res.change){
  
          clearInterval(interval);

          if(!stop){
            intervalHarvester(res.newFrequency)
          }
          
  
        }else{
  
          let newData = hookData();
  
          ESC.harvesterHook(harvesterHookParams, newData, config.chaincodeName);
        }
      })
      
    }, frequency*1000);
  }else{
    let interval = setInterval(() => {
    
      let newData = hookData();
  
      ESC.harvesterHook(harvesterHookParams, newData, config.chaincodeName);
  
    }, frequency*1000);
  
    setTimeout(() => {
      clearInterval(interval);
      console.log("************** EXECUTION COMPLETED, SHUTING DOWN ********************")
    }, config.executionTime*1000 + 100);
  }

}

if (argv._.includes('start')) {

  ESC.configurate(config,config.chaincodeName)

  var stop = false;
  var initialTime = Date.now()
  
  
  var velocities = [];
  var timeStart = [];
  var inde = []
  csv().fromFile(__dirname+'/cars.csv').then((res) => {
    for (let i = 0; i < res.length; i++){
      velocities.push(res[i].VELOCITY);
      timeStart.push(res[i].TIME_START);
      inde.push(i);
    }
  });
  
  ESC.connect(config.chaincodeName).then(() =>{
  
  
    ESC.analyser(analyserParams,config.chaincodeName);
  
    ESC.harvesterListener(config.chaincodeName);
  
  
  
    intervalHarvester(config.harvestFrequency);
    
    
  
    if(config.elasticityMode == "harvestFrequency") {
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
