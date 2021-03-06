'use strict';

const { Contract } = require('fabric-contract-api');

class Analysis extends Contract {

    async initLedger(ctx) {
       
    }

    async createStorage(ctx) {
        
    
        const storage = {
            storageId: 1,
            averages: [],
            stopLightParam: 1,
        };
    
        await ctx.stub.putState('AVERAGES', Buffer.from(JSON.stringify(storage)));
    }

    async addAverage(ctx, parameters) {
        let params = JSON.parse(parameters.toString());
        let average = parseFloat(params.average);

        let query = await this.queryAveragesStorage(ctx);
        let storage = JSON.parse(query.toString())[0].Record;

        storage.averages.push(average);
        if(storage.averages.length > 30){
            storage.averages = storage.averages.slice(Math.max(storage.averages.length) - 30, 0)
        }

        let flow_global = storage.averages.reduce((a,b) => a+b,0)/storage.averages.length;

        if(flow_global > params.jamThreshold){
            storage.stopLightParam = flow_global * params.jamFactor;
        }

        if(flow_global < params.emptyThreshold){
            storage.stopLightParam = -(flow_global * params.emptyFactor);
        }

        await ctx.stub.putState('AVERAGES', Buffer.from(JSON.stringify(storage)));
    }

    async queryAveragesStorage(ctx) {
    
        let queryString = `{
            "selector": {
                "storageId": {
                    "$eq": ${1}
                }
            }
        }`;
        return this.queryWithQueryString(ctx, queryString);
      
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

module.exports = Analysis;
