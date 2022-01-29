# ESC Configuration

In order to implement an ESC you need to instantiate a new ESC. A template for the ESC can be found at
o to [**elastic-smart-contracts/esc-template/**](https://github.com/isa-group/elastic-smart-contracts/blob/master/esc-template).

 The main file in the ESC ```index.js``` has the following number of parameters:
  - **conexionPath**: path to the json file for the conexion to the network.
  - **resultsPath**: path to save the results to.
  - **identityName**: name of the identity to use, usually "admin".
  - **channelName**: name of the channel to connect to.
  - **chaincodeName**: name of the chaincode to use.
  - **csvResultsCalculationsHeader**: header for the calculations result file.
  - **csvResultsExperimentHeader**: header for the experiment result file.


  - **executionTime**: duration of the experiment, in seconds.
  - **analysisFrequency**: frequency for the analyser to launch an analysis, in seconds.
  - **harvestFrequency**: frequency for the harvest to collect data, in seconds.
  - **dataTimeLimit**: time window for data in seconds before being rendered too old, in seconds.
  - **frequencyControlCalculate**: number of calculations between elasticity control.
  - **maximumTimeAnalysis**: maximum time allowed for the calculation before aplying elasticity in miliseconds.
  - **minimumTimeAnalysis**: minimum time allowed for the calculation before aplying elasticity in miliseconds.
  - **elasticityMode**: type of experiment, being "noElasticity" with no elasticity (default), "timeWindow" with elasticity in time window and "harvestFrequency" with elasticty in harvest frequency.
  - **experimentName**: prefix that will be used for the result files.
    
  - **updateDataContract**: name of the contract responsible for uploading new data to the Blockchain.
  - **evaluateWindowTimeContract**: name of the contract responsible for evaluating the time window of data to apply elasticity if necessary.
  - **evaluateHarvestFrequencyContract**: name of the contract responsible for evaluating the frequency to apply elasticity if necessary.
  - **queryAnalysisHolderContract**: name of the contract responsible for querying the Blockchain and returning the calculation storage.
  - **analysisHolderId**: Id of the calculation storage.
  - **analysisContract**: name of the contract responsible for analysing the data.
  - **dataStorageContract**: name of the contract responsible for creating the data storage.
  - **calculationStorageContract**: name of the contract responsible for creating the calculation storage.

Additionaly there are 2 more variables called `harvesterHookParams` and `analyserParams` which are objects containing any specific parameter needed for the ESC.

There is a function `hookData` in which the retrieval of new data is defined. This function and the parameters mentioned are the only changes needed to create a new ESC. An example is as follows:



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
    elasticityMode: "timeWindow",
    experimentName: "test2",
        
    updateDataContract: "updateData",
    evaluateWindowTimeContract: "evaluateHistory",
    evaluateHarvestFrequencyContract: "evaluateFrequency",
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
