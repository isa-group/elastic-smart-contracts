
var ESC = require("../esc/elastic-smart-contract");
const csv = require('csvtojson');
const yargs = require('yargs');

let config = {
  conexionPath: "/home/pablo/Escritorio/Gover/Elastic/governify-network/organizations/peerOrganizations/org1.example.com/connection-org1.json",
  walletPath: "/home/pablo/Escritorio/Gover/Elastic/ESC_network/esc/wallet",
  resultsPath: "/home/pablo/Escritorio/Gover/Elastic/ESC_network/esc-detections/results",
  identityName: "admin",
  channelName: "governifychannel",
  chaincodeName: "governify",
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

const argv = yargs
  .command('start', 'start the experiment', {
    }
  )
.help().alias('help', 'h').argv; 




async function intervalHarvester(frequency) {
  if(config.experimentNumber == 3){
    ESC.frequencyChanged();
    let interval = await setInterval(() => {
  
      ESC.changeFrequency().then((res) =>{
  
        if(res.change){
  
          clearInterval(interval);

          if(!stop){
            intervalHarvester(res.newFrequency)
          }
          
  
        }else{
  
          let newData = {
            detectionDateTime: Date.now(),
            numberCars: inde.filter((i) => {
                return (velocities[i] * (Date.now() - initialTime - timeStart[i])/3600000) >= 0.5 &&
                 (velocities[i] * (Date.now() - initialTime - config.harvestFrequency*1000 - timeStart[i])/3600000) < 0.5;
            }).length,
            sensorKilometer: 0.5,
            direction: 'ASCENDENT',
          };
  
          ESC.harvesterHook(harvesterHookParams, newData);
        }
      })
      
    }, frequency*1000);
  }else{
    let interval = await setInterval(() => {
    
      let newData = {
        detectionDateTime: Date.now(),
        numberCars: inde.filter((i) => {
            return (velocities[i] * (Date.now() - initialTime - timeStart[i])/3600000) >= 0.5 &&
             (velocities[i] * (Date.now() - initialTime - config.harvestFrequency*1000 - timeStart[i])/3600000) < 0.5;
        }).length,
        sensorKilometer: 0.5,
        direction: 'ASCENDENT',
      };
  
      ESC.harvesterHook(harvesterHookParams, newData);
  
    }, frequency*1000);
  
    setTimeout(() => {
      clearInterval(interval);
      console.log("************** EXPERIMENT COMPLETED, SHUTING DOWN ********************")
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
  csv().fromFile(__dirname+'/cars4.csv').then((res) => {
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
    
    
  
    if(config.experimentNumber == 3) {
      setTimeout(() => {
        stop = true;
        console.log("************** EXPERIMENT COMPLETED, SHUTING DOWN ********************")
      }, config.executionTime*1000 + 100);
    }
  
  })

}

module.exports.config = config;