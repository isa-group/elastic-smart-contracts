
var ESC = require("../../esc_core");
const csv = require('csvtojson');
const yargs = require('yargs');

let config = {
  conexionPath: "./network/organizations/peerOrganizations/org1.example.com/connection-org1.json",
  resultsPath: "./esc/street1/results",
  identityName: "admin",
  channelName: "escchannel",
  chaincodeName: "street1",
  csvResultsCalculationsHeader: "NUMBER_DETECTIONS,TOTAL_TIME,FREQUENCY,TIME_DATA,FREQUENCY_DATA,DETECTIONS_STORED,FROM_DATE,TO_DATE,MINIMUM_TIME,MAXIMUM_TIME,CARS_PER_SECOND_BY_SENSOR,CARS_PER_SECOND_TOTAL\n",
  csvResultsExperimentHeader: "FREQUENCY,TIME_DATA,MIN_TIME,MAX_TIME,AVG_TIME,STD_TIME,SUCCESFUL_CALCULATIONS,CALCULATIONS_OVER_MAX\n",


  executionTime: 60,
  analysisFrequency: 5,
  harvestFrequency: 1,
  dataTimeLimit: 30,
  frequencyControlCalculate: 5,
  maximumTimeAnalysis: 100,
  minimumTimeAnalysis: 50,
  elasticityMode: 2,
  experimentName: "test2",
    
  updateDataContract: "updateData",
  evaluateHistoryContract: "evaluateHistory",
  evaluateFrequencyContract: "evaluateFrequency",
  queryAnalysisHolderContract: "queryStreetFlows",
  queryDataStorageContract: "querySensor",
  analysisHolderId: 1,
  analysisContract: "analysis",
  dataStorageContract: "createSensor",
  calculationStorageContract: "createStreetFlows",



}

let harvesterHookParams = {
  
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

  if(config.elasticityMode == 3){
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
  
  ESC.connect().then(() =>{
  
  
    ESC.analyser(analyserParams);
  
    ESC.harvesterListener();
  
  
  
    intervalHarvester(config.harvestFrequency);
    
    
  
    if(config.elasticityMode == 3) {
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