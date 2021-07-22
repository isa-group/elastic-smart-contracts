'use strict';

const { Contract } = require('fabric-contract-api');

class intersection extends Contract {

    async initLedger(ctx) {
       
    }

    async queryStorageData(ctx) {
    
        let queryString = `{
            "selector": {
                "idStorageData": {
                    "$eq": ${1}
                }
            }
        }`;
        return this.queryWithQueryString(ctx, queryString);
    
    }

    async createStorageData(ctx) {
        
    
        const storageData = {
            idStorageData: 1,
            data: [],
        };
    
        await ctx.stub.putState('STORAGEDATA', Buffer.from(JSON.stringify(storageData)));
    }

    async createStorageAnalysis(ctx) {
        
    
        const storage = {
            idStorageAnalysis: 1,
            averages: [],
            stopLightParam: 1,
        };
    
        await ctx.stub.putState('AVERAGES', Buffer.from(JSON.stringify(storage)));
    }

    async queryStorageAnalysis(ctx) {
    
        let queryString = `{
            "selector": {
                "idStorageAnalysis": {
                    "$eq": ${1}
                }
            }
        }`;
        return this.queryWithQueryString(ctx, queryString);
    
    }

    async addAverage(ctx, params) {
        let parameters = JSON.parse(params.toString())
        let dataStorage = JSON.parse(parameters.dataStorage)[0];
        let det = JSON.parse(parameters.data);
        let time = Date.now();
        dataStorage.Record.data = dataStorage.Record.data.filter((i) => {
            return i.detectionDateTime >= (time - parameters.timeData*1000 - 10000);
        });
        for(let i = 0; i< det.length; i++){
            dataStorage.Record.data.push({average: det[i], detectionDateTime: time});
        }
        
        
        await ctx.stub.putState('STORAGEDATA', Buffer.from(JSON.stringify(dataStorage.Record)));

        let event = {
            chaincode: 'intersection',
            type: 'updateData',
            timeData: parameters.timeData,
            frequency: parameters.frequency
        };
        await ctx.stub.setEvent('UpdateDataEvent', Buffer.from(JSON.stringify(event)));
    }


    async analysis(ctx, params) {
        let totalBeginHR = process.hrtime();
        let totalBegin = totalBeginHR[0] * 1000000 + totalBeginHR[1] / 1000;

        let parameters = JSON.parse(params.toString())
        let analysisStorage = JSON.parse(parameters.analysisHolder)[0].Record;
        let frmDates = JSON.parse(parameters.fromDates);

        let totalAnalysisStored = 0;
        let totalAnalysisStoredList = [];
        let analysisList= [];


        if(frmDates.length > 0){

        let storageData = await this.queryStorageData(ctx);
        storageData = JSON.parse(storageData.toString())[0]; 
    
            for(let k=0; k<frmDates.length; k++){
                let fromDate = frmDates[k];
                let toDate = fromDate - (1000* parameters.timeData);
                
                totalAnalysisStored = storageData.Record.data.length;

                let dataToAnalyse = storageData.Record.data.filter((i) => {
                    return parseInt(fromDate) >= i.detectionDateTime && i.detectionDateTime >= parseInt(toDate);
                });
                analysisList.push(dataToAnalyse.length)

                let flow_global = dataToAnalyse.reduce((a,b) => a+b.average,0)/dataToAnalyse.length;

                if(flow_global > parameters.jamThreshold){
                    analysisStorage.stopLightParam = flow_global * parameters.jamFactor;
                }

                if(flow_global < parameters.emptyThreshold){
                    analysisStorage.stopLightParam = -(flow_global * parameters.emptyFactor);
                }


                analysisStorage.averages.push(flow_global)
                
                totalAnalysisStoredList.push(totalAnalysisStored);
  
               
            }
            

            await ctx.stub.putState('AVERAGES', Buffer.from(JSON.stringify(analysisStorage)));
            


        }
        let totalEndHR = process.hrtime()
        let totalEnd = totalEndHR[0] * 1000000 + totalEndHR[1] / 1000;
        let totalDuration = (totalEnd - totalBegin) / 1000;

        let info = [];

        let event = {
            chaincode: 'intersection',
            execDuration: totalDuration,
            analysisList: analysisList,
            timeData: parameters.timeData,
            type: 'analysis',
            fromDates: frmDates,
            frequencyData: parameters.frequency,
            totalDataStoredList: totalAnalysisStoredList,
            info: info

        };
        await ctx.stub.setEvent('FlowEvent', Buffer.from(JSON.stringify(event)));
    }


    async evaluateHistory(ctx, timeData, calculateTime, maxCalculateTime, minCalculateTime) {
        
        if(parseInt(calculateTime) >= parseInt(maxCalculateTime)*0.9){
            return JSON.parse(parseInt(timeData)*0.75);
        }else if(parseInt(calculateTime) <= parseInt(minCalculateTime)*1.1){
            return JSON.parse(parseInt(timeData)*1.25);
        }else{
            return JSON.parse(timeData);
        }
    
    }

    async evaluateFrequency(ctx, frequency, calculateTime, maxCalculateTime, minCalculateTime) {
        
        if(parseFloat(calculateTime) >= parseFloat(maxCalculateTime)*0.9){
            return JSON.parse(parseFloat(frequency)*1.25);
        }else if(parseFloat(calculateTime) <= parseFloat(minCalculateTime)*1.1){
            return JSON.parse(parseFloat(frequency)*0.75);
        }else{
            return JSON.parse(frequency);
        }
    
    }
        
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

module.exports = intersection;
