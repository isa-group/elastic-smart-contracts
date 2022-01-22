
'use strict';

const { Contract } = require('fabric-contract-api');

class analytics_chaincode extends Contract {

    /**
    * Initialize the chaincode
    * @async
    */
    async initLedger(ctx) {

    }

    /**
    * Gets a specific data from the blockchain
    * @async
    * @param {number} responseData - The id of the data to get.
    */
     async queryData(ctx, responseData) {
    
        let queryString = `{
            "selector": {
                "responseData": {
                    "$eq": ${responseData}
                }
            }
        }`;
        return this.queryWithQueryString(ctx, queryString);
    
    }

    /**
    * Creates the data storage for this chaincode, which is some data.
    * @async
    */
    async createData(ctx) {
        
    
        const data = {
            responseData: 1,
            responses: [],
        };
    
        await ctx.stub.putState('DATA1', Buffer.from(JSON.stringify(data)));
    }

    /**
    * Gets the calculation storage for this chaincode.
    * @async
    */
    async queryDataCalculation(ctx, dataId) {
    
        let queryString = `{
            "selector": {
                "dataId": {
                    "$eq": ${dataId}
                }
            }
        }`;
        return this.queryWithQueryString(ctx, queryString);
    
    }

    /**
    * Creates the calculation storage for this chaincode.
    * @async
    */
    async createDataCalculation(ctx) {
        
    
        const dataCalculation = {
            dataId: 1,
            data: [],
        };
    
        await ctx.stub.putState('DATACALCULATION1', Buffer.from(JSON.stringify(dataCalculation)));
    }

    /**
    * Submit the new data given to the blockchain.
    * @async
    * @param {object} params - An object with all the parameters necessary which are the id of the data storage, the array of data to introduce,
    * the current time window for the data and the frequency to harvest data.
    */
    async updateData(ctx, params) {

        let parameters = JSON.parse(params.toString())
        let s = await this.queryData(ctx, parseInt(parameters.dataNumber));
        let data = JSON.parse(s.toString())[0];
        let det = JSON.parse(parameters.data);
        let time = Date.now();
        data.Record.responses = data.Record.responses.filter((i) => {
            return i.dataCollectedDateTime >= (time - parameters.timeData*1000 - 10000);
        });
        for(let i = 0; i< det.length; i++){
            data.Record.responses.push(det[i]);
        }
        

        await ctx.stub.putState(data.Key, Buffer.from(JSON.stringify(data.Record)));

        let event = {
            type: 'updateData',
            timeData: parameters.timeData,
            frequency: parameters.frequency
        };
        await ctx.stub.setEvent('UpdateDataEvent', Buffer.from(JSON.stringify(event)));

    }


    /**
    * Analyses data and submits the result to the blockchain.
    * @async
    * @param {object} params - An object with all the parameters necessary which are the calculation storage, the dates from which collect data
    * to analyse it, the data number, the current time window for the data and the current frequency.
    */
     async analysis(ctx, params) {

        let totalBeginHR = process.hrtime();
        let totalBegin = totalBeginHR[0] * 1000000 + totalBeginHR[1] / 1000;

        let parameters = JSON.parse(params.toString())
        let frmDates = JSON.parse(parameters.fromDates);
        let data = [];
        let bySection = [];
        let totalNumbers = 0;
        let total = 0;
        let numData = parseInt(parameters.dataNumbers);
        let totalNumbersStored = 0;
        let totalNumbersStoredList = [];

        let totalNumbersEvent = [];
        var aboveTreshold = [];
        var wrongResponsesPercentage = [];
        let totalWrongResponses = 0;
        if(frmDates.length > 0){

            for(let j=1; j<=numData; j++){
                let dataResponse = await this.queryData(ctx, j);
                data.push(JSON.parse(dataResponse.toString())[0]);
            }
    
            for(let k=0; k<frmDates.length; k++){
                let fromDate = frmDates[k];
                let toDate = fromDate - (1000* parameters.timeData);
                
                for(let l=0;l<data.length; l++){
                    totalNumbersStored += data[l].Record.responses.length;

                    var responses = data[l].Record.responses.filter((i) => {
                        return parseInt(fromDate) >= i.dataCollectedDateTime && i.dataCollectedDateTime >= parseInt(toDate);
                    });

                    let numberResponses = 0;
                    for(let i=0; i< responses.length; i++){
                        numberResponses += responses[i].numberResponses
                        for(let j=0; j< responses[i].responses.length;j++){
                            if(responses[i].responses[j].code != 200){
                                totalWrongResponses +=  parseInt(responses[i].responses[j].number);
                            }
                        }
                    }
                    totalWrongResponses = (totalWrongResponses/numberResponses) * 100;
                    bySection.push(parseFloat(((numberResponses *1000) /  (fromDate - toDate)).toFixed(3)));
                    total += parseFloat(((numberResponses *1000) /  (fromDate - toDate)).toFixed(3));
                    totalNumbers += numberResponses;
                }
                aboveTreshold.push(totalWrongResponses > 50 ? true : false)
                wrongResponsesPercentage.push(totalWrongResponses)
                totalWrongResponses = 0;
                totalNumbersStoredList.push(totalNumbersStored);
                totalNumbersEvent.push(totalNumbers);
                bySection = [];
                totalNumbers = 0;
                total = 0;
                totalNumbersStored = 0;
            }

        }
        let totalEndHR = process.hrtime()
        let totalEnd = totalEndHR[0] * 1000000 + totalEndHR[1] / 1000;
        let totalDuration = (totalEnd - totalBegin)/1000;

        if (frmDates.length == 0){
            totalDuration = 0;
        }

        let info = [aboveTreshold,wrongResponsesPercentage];

        let event = {
            execDuration: totalDuration,
            analysisList: totalNumbersEvent,
            timeData: parameters.timeData,
            type: 'analysis',
            fromDates: frmDates,
            frequencyData: parameters.frequency,
            totalDataStoredList: totalNumbersStoredList,
            info: info

        };
        await ctx.stub.setEvent('FlowEvent', Buffer.from(JSON.stringify(event)));
      }

    /**
    * Evaluates the current calculation time and reajust the time window for data if necessary.
    * @async
    * @param {number} timeData - Current time window.
    * @param {number} calculateTime - Current calculation time.
    * @param {number} maxCalculateTime - Maximum calculation time allowed.
    * @param {number} minCalculateTime - Minimum calculation time allowed.
    */
     async evaluateHistory(ctx, timeData, calculateTime, maxCalculateTime, minCalculateTime) {
        
        if(parseInt(calculateTime) >= parseInt(maxCalculateTime)*0.9){
            return JSON.parse(parseInt(timeData)*0.75);
        }else if(parseInt(calculateTime) <= parseInt(minCalculateTime)*1.1){
            return JSON.parse(parseInt(timeData)*1.25);
        }else{
            return JSON.parse(timeData);
        }
    
    }

    /**
    * Evaluates the current calculation time and reajust the frequency for harvesting data if necessary.
    * @async
    * @param {number} frequency - Current frequency.
    * @param {number} calculateTime - Current calculation time.
    * @param {number} maxCalculateTime - Maximum calculation time allowed.
    * @param {number} minCalculateTime - Minimum calculation time allowed.
    */
    async evaluateFrequency(ctx, frequency, calculateTime, maxCalculateTime, minCalculateTime) {
        
        if(parseFloat(calculateTime) >= parseFloat(maxCalculateTime)*0.9){
            return JSON.parse(parseFloat(frequency)*1.25);
        }else if(parseFloat(calculateTime) <= parseFloat(minCalculateTime)*1.1){
            return JSON.parse(parseFloat(frequency)*0.75);
        }else{
            return JSON.parse(frequency);
        }
    
    }
    
    /**
    * Auxiliary function to query the blockchain.
    * @async
    * @param {string} queryString - Query to process.
    */
    async queryWithQueryString(ctx, queryString) {
    
        console.log('query String');
        console.log(JSON.stringify(queryString));
    
        let resultsIterator = await ctx.stub.getQueryResult(queryString);
    
        let allResults = [];
    
        while (true) {
            let res = await resultsIterator.next();
    
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
    
                console.log(res.value.value.toString('utf8'));
    
                jsonRes.Key = res.value.key;
    
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
    
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await resultsIterator.close();
                console.info(allResults);
                console.log(JSON.stringify(allResults));
                return JSON.stringify(allResults);
            }
        }
    
    }



}

module.exports = analytics_chaincode;
