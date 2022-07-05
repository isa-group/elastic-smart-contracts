
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
        if(data.Record.responses.length < 240){
            for (let j = 0; j < parameters.dataPerHarvest; j++) {
                for(let i = 0; i < det.length; i++){
                    data.Record.responses.push(det[i]);
                }
            }
        }

        // data.Record.responses = [det[det.length-1]];
        

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
        const vm = require('vm');

        let totalBeginHR = process.hrtime();

        let parameters = JSON.parse(params.toString())
        let frmDates = JSON.parse(parameters.fromDates);
        let data = [];
        let bySection = [];
        let totalNumbers = 0;
        let total = 0;
        let numData = parseInt(parameters.dataNumbers);
        let analysisID = parameters.analysisID;
        let totalNumbersStored = 0;
        let totalNumbersStoredList = [];

        let totalNumbersEvent = [];
        let guaranteesValues = {};
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

                    var agreement = data[l].Record.responses[0].agreement


                    var metricValues = [];
                    for(let m=0; m<data[l].Record.responses.length; m++){
                        metricValues.push(data[l].Record.responses[m].responses);
                    }

                    var timedScopes = data[l].Record.responses[0].timedScopes

                    let numberResponses = 0;

                    function calculatePenalty(guarantee, timedScope, metricsValues, slo, penalties){
                        const guaranteeValue = {};
                        const ofElement = guarantee.of[0]
                        guaranteeValue.scope = timedScope.scope;
                        guaranteeValue.period = timedScope.period;
                        guaranteeValue.guarantee = guarantee.id;
                        guaranteeValue.evidences = [];
                        guaranteeValue.metrics = {};
                        const values = [];
                        var penalties = {};// Temporal fix
                    
                        for (const metricId in ofElement.with) {
                            let value = 0;
                            if (metricsValues[metricId]) {
                                value = metricsValues[metricId].value;
                            }
                            if (value === 'NaN' || value === '') {
                                console.log('Unexpected value (' + value + ') for metric ' + metricId + ' ');
                                return;
                            }
                            vm.runInThisContext(metricId + ' = ' + value);
                            guaranteeValue.metrics[metricId] = value;
                            if (metricsValues[metricId] && metricsValues[metricId].evidences) {
                            guaranteeValue.evidences = guaranteeValue.evidences.concat(metricsValues[metricId].evidences);
                            } else {
                                console.log('Metric without evidences: ' + JSON.stringify(metricsValues[metricId], null, 2));
                            }
                    
                            const val = {};
                            val[metricId] = value;
                            values.push(val);
                        }
                    
                        const fulfilled = Boolean(vm.runInThisContext(slo));
                        guaranteeValue.value = fulfilled;
                    
                        if (!fulfilled && penalties.length > 0) {
                            guaranteeValue.penalties = {};
                            penalties.forEach(function (penalty) {
                            const penaltyVar = Object.keys(penalty.over)[0];
                            const penaltyFulfilled = penalty.of.filter(function (compensationOf) {
                                return vm.runInThisContext(compensationOf.condition);
                            });
                            if (penaltyFulfilled.length > 0) {
                                guaranteeValue.penalties[penaltyVar] = parseFloat(vm.runInThisContext(penaltyFulfilled[0].value));
                            } else {
                                guaranteeValue.penalties[penaltyVar] = 0;
                                console.log('SLO not fulfilled and no penalty found: ');
                                console.log('\t- penalty: ', penalty.of);
                                console.log('\t- metric value: ', values);
                            }
                            });
                        }
                        return guaranteeValue;
                    }

                    agreement.terms.guarantees.map((guarantee) => {
                        if(guarantee.of[0].reliable){
                            let guaranteeValues = [];
                          for (let index = 0; index < timedScopes.length; index++) {
                            let guaranteeValue = calculatePenalty(guarantee,timedScopes[index],metricValues[index],guarantee.of[0].objective,guarantee.of[0].penalties)
                            if (guaranteeValue) {
                                guaranteeValues.push(guaranteeValue);
                            }
                          }
                          guaranteesValues[guarantee.id] = guaranteeValues;
                        }
                      })
                    bySection.push(parseFloat(((numberResponses *1000) /  (fromDate - toDate)).toFixed(3)));
                    total += parseFloat(((numberResponses *1000) /  (fromDate - toDate)).toFixed(3));
                    totalNumbers += numberResponses;
                }
                totalNumbersStoredList.push(totalNumbersStored);
                totalNumbersEvent.push(totalNumbers);
                bySection = [];
                totalNumbers = 0;
                total = 0;
                totalNumbersStored = 0;
            }

        }
        let totalEndHR = process.hrtime(totalBeginHR)
        let totalDuration = (totalEndHR[0]* 1000000000 + totalEndHR[1]) / 1000000;

        if (frmDates.length == 0){
            totalDuration = 0;
        }

        let info = [[analysisID],[Object.keys(guaranteesValues).length]];

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

        let s = await this.queryDataCalculation(ctx, 1);
        let data2 = JSON.parse(s.toString())[0];
        data2.Record.responses = [guaranteesValues];
        

        await ctx.stub.putState(data2.Key, Buffer.from(JSON.stringify(data2.Record)));
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
        
        if(parseFloat(calculateTime) >= parseFloat(maxCalculateTime)){
            return JSON.parse(parseFloat(timeData)*0.75);
        }else if(parseFloat(calculateTime) <= parseFloat(minCalculateTime)){
            return JSON.parse(parseFloat(timeData)*1.25);
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
