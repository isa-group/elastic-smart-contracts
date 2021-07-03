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
  - **experimentNumber**: type of experiment, being "1" with no elasticity (default), "2" with elasticity in time window and "3" with elasticty in frequency.
  - **experimentName**: prefix that will be used for the result files.
    
  - **updateDataContract**: name of the contract responsible for uploading new data to the Blockchain.
  - **evaluateHistoryContract**: name of the contract responsible for evaluating the time window of data to apply elasticity if necessary.
  - **evaluateFrequencyContract**: name of the contract responsible for evaluating the frequency to apply elasticity if necessary.
  - **queryAnalysisHolderContract**: name of the contract responsible for querying the Blockchain and returning the calculation storage.
  - **analysisHolderId**: Id of the calculation storage.
  - **analysisContract**: name of the contract responsible for analysing the data.
  - **dataStorageContract**: name of the contract responsible for creating the data storage.
  - **calculationStorageContract**: name of the contract responsible for creating the calculation storage.