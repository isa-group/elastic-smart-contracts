
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
        for(let i = 0; i < det.length; i++){
            data.Record.responses.push(det[i]);
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



}

module.exports = analytics_chaincode;
