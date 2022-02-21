
var ESC = require("../../esc_core");
const yargs = require('yargs');
const JSONStream = require('JSONStream');
const governify = require('governify-commons');

let config = {
  conexionPath: "./network/organizations/peerOrganizations/org1.example.com/connection-org1.json",
  resultsPath: "./esc/governify/results",
  identityName: "admin",
  channelName: "escchannel",
  chaincodeName: "governify",
  csvResultsCalculationsHeader: "RESPONSES,TOTAL_TIME,FREQUENCY,TIME_DATA,FREQUENCY_DATA,RESPONSES_STORED,FROM_DATE,TO_DATE,MINIMUM_TIME,MAXIMUM_TIME,GUARANTEES\n",
  csvResultsExperimentHeader: "FREQUENCY,TIME_DATA,MIN_TIME,MAX_TIME,AVG_TIME,STD_TIME,SUCCESFUL_CALCULATIONS,CALCULATIONS_OVER_MAX\n",


  executionTime: 1000,
  analysisFrequency: 15,
  harvestFrequency: 10,
  dataTimeLimit: 60,
  frequencyControlCalculate: 1,
  maximumTimeAnalysis: 13,
  minimumTimeAnalysis: 7,
  elasticityMode: "harvestFrequency",
  experimentName: "AAA",
    
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

var stop = false;

// New data to be introduced, define here how the data is collected 
// async function hookData(){
//   let totalResponses = 0;
  
//   const metricValues = []

//   let newData = {
//     dataCollectedDateTime: Date.now(),
//     numberResponses: totalResponses,
//     responses: responses
//   };
//   return newData;
// }

async function hookData(metricQueries, agreement){
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  var metrics = []
  let requests = metricQueries.map( metricQuery => {
    return new Promise(async (resolve) => {
        var compositeResponse = [];
        const collector = metricQuery.collector;
        const urlParams = metricQuery.urlParams;
        const metric = metricQuery.metric;
        const requestMetric = await governify.infrastructure.getService(collector.infrastructurePath).request({
            url: collector.endpoint + '/' + collector.name.replace(/^\//, '') + '?' + encodeURI(urlParams),
            method: 'GET',
            responseType: 'stream'
        }).catch(err => {
            const errorString = 'Error in PPINOT Computer response ' + err.response.status + ':' + err.response.data;
            console.log(errorString)
        });
        const requestStream = requestMetric.data;
        requestStream.pipe(JSONStream.parse()).on('data', monthMetrics => {
            try {
                // Check if computer response is correct
                if (monthMetrics && Array.isArray(monthMetrics)) {
                  // For each state returned by computer map the scope
                  monthMetrics.forEach(function (metricState) {
                      // if (metricState.log) {
                      // // Getting the correct log for mapping scope
                      // const logId = Object.keys(metricState.log)[0];
                      // const log = agreement.context.definitions.logs[logId];
                      // // doing scope mapping
                      // metricState.scope = utils.scopes.computerToRegistryParser(metricState.scope, log.scopes);
                      // }
                      // aggregate metrics in order to return all
                      compositeResponse.push(metricState);
                  });
                } else {
                const errorString = 'Error in computer response for metric: ' + metric + '. Response is not an array:  ' + JSON.stringify(monthMetrics);
                }
            } catch (err) {
                const errorString = 'Error processing computer response for metric: ' + metric;
            }
        }).on('end', function () {
            metrics.push({
                metricId: metric,
                metricValues: compositeResponse[0]
            });
            resolve();
        });
    });

  });

  return Promise.all(requests).then(() => {
    let metricValues = {}
    agreement.terms.guarantees.map((guarantee) => {
      if(guarantee.of[0].reliable){
          //cambiar period al último de la garantía
          let guaranteeMetrics = Object.keys(guarantee.of[0].with);
          for (let m in agreement.terms.metrics) {
              if(guaranteeMetrics.includes(m)){
                  let rightMetric = metrics.find( (e) => {
                      return e.metricId === m
                  })
                  metricValues[m] = rightMetric.metricValues
              }
          }
      }
    })
    let newData = {
      dataCollectedDateTime: Date.now(),
      numberResponses: metrics.length,
      responses: metricValues,
      agreement: agreement
    };
    return newData;
  })
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
async function intervalHarvester(frequency, metricQueries, agreement) {

  if(config.elasticityMode == "harvestFrequency"){
    ESC.frequencyChanged();
    let interval = await setInterval(() => {
  
      ESC.getNewFrequency().then(async (res) =>{
  
        if(res.change){
  
          clearInterval(interval);

          if(!stop){
            intervalHarvester(res.newFrequency, metricQueries, agreement)
          }
          
  
        }else{
  
          let newData = await hookData(metricQueries, agreement);
  
          ESC.harvesterHook(harvesterHookParams, newData);

        }
      })
      
    }, frequency*1000);
  }else{
    let interval = await setInterval(async () => {
    
      let newData = await hookData(metricQueries, agreement);
  
      ESC.harvesterHook(harvesterHookParams, newData);
  
    }, frequency*1000);
  
    setTimeout(() => {
      clearInterval(interval);
      console.log("************** EXECUTION COMPLETED, SHUTING DOWN ********************")
    }, config.executionTime*1000 + 100);
  }

}

function start(metricQueries, agreement){

  ESC.configurate(config)

  stop = false;
  
  ESC.connect().then(() =>{
  
    ESC.analyser(analyserParams);
  
    ESC.harvesterListener();
  
    intervalHarvester(config.harvestFrequency, metricQueries, agreement);

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
module.exports.start = start;