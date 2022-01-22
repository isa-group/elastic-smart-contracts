
var ESC = require("../../esc_core");
const csv = require('csvtojson');
const yargs = require('yargs');
const axios = require('axios');

let config = {
  conexionPath: "./network/organizations/peerOrganizations/org1.example.com/connection-org1.json",
  resultsPath: "./esc/governify/results",
  identityName: "admin",
  channelName: "escchannel",
  chaincodeName: "governify",
  csvResultsCalculationsHeader: "RESPONSES,TOTAL_TIME,FREQUENCY,TIME_DATA,FREQUENCY_DATA,RESPONSES_STORED,FROM_DATE,TO_DATE,MINIMUM_TIME,MAXIMUM_TIME,ABOVE_THRESHOLD,WRONG_RESPONSES_PERCENTAGE\n",
  csvResultsExperimentHeader: "FREQUENCY,TIME_DATA,MIN_TIME,MAX_TIME,AVG_TIME,STD_TIME,SUCCESFUL_CALCULATIONS,CALCULATIONS_OVER_MAX\n",


  executionTime: 120,
  analysisFrequency: 10,
  harvestFrequency: 5,
  dataTimeLimit: 60,
  frequencyControlCalculate: 1,
  maximumTimeAnalysis: 13,
  minimumTimeAnalysis: 7,
  elasticityMode: "harvestFrequency",
  experimentName: "testA",
    
  updateDataContract: "updateData",
  evaluateWindowTimeContract: "evaluateHistory",
  evaluateHarvestFrequencyContract: "evaluateFrequency",
  queryAnalysisHolderContract: "queryDataCalculation",
  analysisHolderId: 2,
  analysisContract: "analysis",
  dataStorageContract: "createData",
  calculationStorageContract: "createDataCalculation",



}

let harvesterHookParams = {
  dataNumber: 1
}

let analyserParams = {
  dataNumbers: 1
}



// New data to be introduced, define here how the data is collected 
async function hookData(){
  let totalResponses = 0;
  let responses = await axios.get("http://37.187.8.193:4040/metrics").then(function (response) {
    responsesRes = []
    responsesArr = response.data.split("\n")
    for(let i = 2;i< 8;i++){
      response = responsesArr[i];
      code = response.split('status="')[1].split('"}')[0];
      number = response.split('} ')[1];
      totalResponses += parseInt(number);
      responsesRes.push({code:code,number:number});
    }
    return responsesRes;
    }).catch(function (error) {
      console.log(error);
    })

  let newData = {
    dataCollectedDateTime: Date.now(),
    numberResponses: totalResponses,
    responses: responses
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
    ESC.frequencyChanged();
    let interval = await setInterval(() => {
  
      ESC.getNewFrequency().then(async (res) =>{
  
        if(res.change){
  
          clearInterval(interval);

          if(!stop){
            intervalHarvester(res.newFrequency)
          }
          
  
        }else{
  
          let newData = await hookData();
  
          ESC.harvesterHook(harvesterHookParams, newData);

        }
      })
      
    }, frequency*1000);
  }else{
    let interval = await setInterval(async () => {
    
      let newData = await hookData();
  
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
  
  ESC.connect().then(() =>{
  
  
    ESC.analyser(analyserParams);
  
    ESC.harvesterListener();
  
  
  
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
