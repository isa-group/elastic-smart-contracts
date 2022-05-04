

# Minimum smart contracts required

## Create Data Storage
    A contract that creates a data storage object in the blockchain.

## Query Data Storage
    A contract that returns the data storage object.

## Create Calculation Storage 
    A contract that creates a calculation storage object in the blockchain.

## Query Calculation Storage 
    A contract that returns the calculation storage object.
 
## Evaluate frequency 
    This contract receives 4 parameters: 
        -frequency: the current frequency for harvesting data.
        -calculateTime: current calculation time.
        -maxCalculateTime: maximum calculation time allowed.
        -minCalculateTime: minimum calculation time allowed.
    
    From this 4 parameters an evaluation has to be carried out and a frequency returned, either the same one or a new one.

## Evaluate time window 
    This contract receives 4 parameters: 
        -timeData: the current time window for data to be saved.
        -calculateTime: current calculation time.
        -maxCalculateTime: maximum calculation time allowed.
        -minCalculateTime: minimum calculation time allowed.
    
    From this 4 parameters an evaluation has to be carried out and a time window returned, either the same one or a new one.

## Update data 
    This contract receives an object "params" which contains the default parameters:

        -data: an array of objects, each one being a new data to introduce in the blockchain.

        -frequency: the current frequency for harvesting data.

        -timeData: the current time window for data to be saved.

    Plus any additional parameter defined previously.

    Each new data must be saved in the blockchain, additionally, an event must be created and launch with this estructure:
        event = {
            type: 'updateData',
            timeData: timeData,
            frequency: frequency
        };

## Analysis
    This contract receives an object "params" which contains the default parameters:

        -frequency: the current frequency for harvesting data.

        -timeData: the current time window for data to be saved.

        -fromDates: an array of numbers in which every number represents an analysis to be done, the dates have been treated as the number of miliseconds passed since the 1 of January of 1970 (what Date.now() returns), this number represent the upper limit of the period for the data to analyse and 
        the period can be know using the timeData.

        -analysisHolder: the calculation storage previously queried and sent as parameter.
    
    Plus any additional parameter defined previously.

    Each new calculation must be saved in the blockchain, additionally, an event must be created and launch with this estructure:
        event = {
            execDuration: Duration of the execution,
            analysisList: List of the number of data analysed for each analysis done during this callback,
            timeData: timeData,
            type: 'analysis',
            fromDates: fromDates,
            frequencyData: frequency,
            totalDataStoredList: total number of data stored at the moment of the calculation,
            info: An array of objects containing any additional information that is wanted about the analysis
        };