
'use strict';

const { Contract } = require('fabric-contract-api');

class Governify extends Contract {

    /**
    * Initialize the chaincode
    * @async
    */
    async initLedger(ctx) {
       
    }

    /**
    * Gets a sensor from the blockchain
    * @async
    * @param {number} numberSensor - The id of the sensor to get.
    */
    async querySensor(ctx, numberSensor) {
    
        let queryString = `{
            "selector": {
                "numberSensor": {
                    "$eq": ${numberSensor}
                }
            }
        }`;
        return this.queryWithQueryString(ctx, queryString);
    
    }

    /**
    * Creates the data storage for this chaincode, which is a sensor.
    * @async
    */
    async createSensor(ctx) {
        
    
        const sensor = {
            numberSensor: 1,
            detections: [],
        };
    
        await ctx.stub.putState('SENSOR1', Buffer.from(JSON.stringify(sensor)));
    }

    /**
    * Gets the calculation storage for this chaincode.
    * @async
    */
    async queryStreetFlows(ctx, streetId) {
    
        let queryString = `{
            "selector": {
                "streetId": {
                    "$eq": ${streetId}
                }
            }
        }`;
        return this.queryWithQueryString(ctx, queryString);
    
    }

    /**
    * Creates the calculation storage for this chaincode.
    * @async
    */
    async createStreetFlows(ctx) {
        
    
        const streetflows = {
            streetId: 1,
            flows: [],
        };
    
        await ctx.stub.putState('STREETFLOWS1', Buffer.from(JSON.stringify(streetflows)));
    }

    /**
    * Submit the new data given to the blockchain.
    * @async
    * @param {object} params - An object with all the parameters necessary which are the id of the data storage, the array of data to introduce, 
    * the current time window for the data and the frequency to harvest data.
    */
    async updateData(ctx, params) {
        let parameters = JSON.parse(params.toString())
        let s = await this.querySensor(ctx, parseInt(parameters.numberSensor));
        let sensor = JSON.parse(s.toString())[0];
        let det = JSON.parse(parameters.data);
        let time = Date.now();
        sensor.Record.detections = sensor.Record.detections.filter((i) => {
            return i.detectionDateTime >= (time - parameters.timeData*1000 - 10000);
        });
        for(let i = 0; i< det.length; i++){
            sensor.Record.detections.push(det[i]);
        }
        

        await ctx.stub.putState(sensor.Key, Buffer.from(JSON.stringify(sensor.Record)));

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
    * to analyse it, the number of sensors in the street, the current time window for the data and the current frequency.
    */
    async analysis(ctx, params) {
        let totalBeginHR = process.hrtime();
        let totalBegin = totalBeginHR[0] * 1000000 + totalBeginHR[1] / 1000;

        let parameters = JSON.parse(params.toString())
        let strFlow = JSON.parse(parameters.analysisHolder)[0].Record;
        let frmDates = JSON.parse(parameters.fromDates);
        let sensors = [];
        let bySection = [];
        let totalDetections = 0;
        let total = 0;
        let numSens = parseInt(parameters.numberSensors);
        let totalDetectionsStored = 0;
        let totalDetectionsStoredList = [];

        let totalDetectionsEvent = [];
        let bySectionEvent = [];
        let totalEvent = [];
        if(frmDates.length > 0){

            for(let j=1; j<=numSens; j++){
                let sensor = await this.querySensor(ctx, j);
                sensors.push(JSON.parse(sensor.toString())[0]);
            }
    
            for(let k=0; k<frmDates.length; k++){
                let fromDate = frmDates[k];
                let toDate = fromDate - (1000* parameters.timeData);
                
                for(let l=0;l<sensors.length; l++){
                    totalDetectionsStored += sensors[l].Record.detections.length;

                    let detections = sensors[l].Record.detections.filter((i) => {
                        return parseInt(fromDate) >= i.detectionDateTime && i.detectionDateTime >= parseInt(toDate);
                    });
                    let numberCars = 0;
                    for(let i=0; i< detections.length; i++){
                        numberCars +=  parseInt(detections[i].numberCars);
                    }
                    bySection.push(parseFloat(((numberCars *1000) /  (fromDate - toDate)).toFixed(3)));
                    total += parseFloat(((numberCars *1000) /  (fromDate - toDate)).toFixed(3));
                    totalDetections += numberCars;
                }
                totalDetectionsStoredList.push(totalDetectionsStored);
                bySectionEvent.push(`[${bySection.toString().replace(/,/g,";")}]`);
                totalEvent.push(total/parameters.numberSensors);
                totalDetectionsEvent.push(totalDetections);
                let carFlow = {
                    streetId: strFlow.streetId,
                    dateFlow: {
                        fromDate: parseInt(fromDate),
                        toDate: parseInt(toDate)
                    },
                    carsPerSecond: {
                        bySection,
                        total: total/numSens
                    },
                    totalDetections,
                };
                if(totalDetections > 0){
                    strFlow.flows.push(carFlow);
                }
                bySection = [];
                totalDetections = 0;
                total = 0;
                totalDetectionsStored = 0;
            }
            
            if(strFlow.flows.length > 0){
                await ctx.stub.putState('STREETFLOWS' + strFlow.streetId, Buffer.from(JSON.stringify(strFlow)));
            }


        }
        let totalEndHR = process.hrtime()
        let totalEnd = totalEndHR[0] * 1000000 + totalEndHR[1] / 1000;
        let totalDuration = (totalEnd - totalBegin) / 1000;

        if (frmDates.length == 0){
            totalDuration = 0;
        }

        let info = [bySectionEvent, totalEvent];

        let event = {
            execDuration: totalDuration,
            analysisList: totalDetectionsEvent,
            timeData: parameters.timeData,
            type: 'analysis',
            fromDates: frmDates,
            frequencyData: parameters.frequency,
            totalDataStoredList: totalDetectionsStoredList,
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

module.exports = Governify;
