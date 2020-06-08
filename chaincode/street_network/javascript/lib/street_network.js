/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Street_network extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        /*const detections = [
            {
                streetId: 1,
                detectionDateTime: 1588698495684,
                detectionKilometer: 1,
                detectionLatitude: -5.930535,
                detectionLongitude: 37.342912,
                direction: 'ASCENDENT',
                
            },
            {
                streetId: 1,
                detectionDateTime: 1588698494684,
                detectionKilometer: 2,
                detectionLatitude: -5.930535,
                detectionLongitude: 37.342912,
                direction: 'DESCENDENT',
                
            },
            {
                streetId: 1,
                detectionDateTime: 1588698493684,
                detectionKilometer: 2,
                detectionLatitude: -5.930535,
                detectionLongitude: 37.342912,
                direction: 'ASCENDENT',
                
            },
            {
                streetId: 1,
                detectionDateTime: 1588698492684,
                detectionKilometer: 3,
                detectionLatitude: -5.930535,
                detectionLongitude: 37.342912,
                direction: 'ASCENDENT',
                
            },
            {
                streetId: 1,
                detectionDateTime: 1588698491684,
                detectionKilometer: 4,
                detectionLatitude: -5.930535,
                detectionLongitude: 37.342912,
                direction: 'DESCENDENT',
                
            },
            {
                streetId: 1,
                detectionDateTime: 1588698490684,
                detectionKilometer: 4,
                detectionLatitude: -5.930535,
                detectionLongitude: 37.342912,
                direction: 'ASCENDENT',
                
            },
            {
                streetId: 2,
                detectionDateTime: 1588698489684,
                detectionKilometer: 1,
                detectionLatitude: -5.930535,
                detectionLongitude: 37.342912,
                direction: 'ASCENDENT',
                
            },
            {
                streetId: 2,
                detectionDateTime: 1588698488684,
                detectionKilometer: 1,
                detectionLatitude: -5.930535,
                detectionLongitude: 37.342912,
                direction: 'DESCENDENT',
                
            },
            {
                streetId: 2,
                detectionDateTime: 1588698487684,
                detectionKilometer: 6,
                detectionLatitude: -5.930535,
                detectionLongitude: 37.342912,
                direction: 'ASCENDENT',
                
            },
            {
                streetId: 2,
                detectionDateTime: 1588698486684,
                detectionKilometer: 3,
                detectionLatitude: -5.930535,
                detectionLongitude: 37.342912,
                direction: 'DESCENDENT',
                
            },
            {
                streetId: 2,
                detectionDateTime: 1588698485684,
                detectionKilometer: 7,
                detectionLatitude: -5.930535,
                detectionLongitude: 37.342912,
                direction: 'ASCENDENT',
                
            },
        ];

        let indexName = 'street~kilometer'



        for (let i = 0; i < detections.length; i++) {
            detections[i].docType = 'detection';
            await ctx.stub.putState('DETECTION' + i, Buffer.from(JSON.stringify(detections[i])));
            console.info('Added <--> ', detections[i]);
        }*/
        console.info('============= END : Initialize Ledger ===========');
    }


    async queryAllDetections(ctx) {
        const startKey = 'DETECTION0';
        const endKey = 'DETECTION99999999999999999';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }
    async queryAllFlows(ctx) {
        const startKey = 'CARFLOW0';
        const endKey = 'CARFLOW9999999999999999';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async createDetection(ctx, numberSensor, detectionNumber, sensorKilometer, direction, numberCars) {
        let detectionDateTime = Date.now();
        let sensor = parseInt(numberSensor)
        const detection = {
            sensor,
            docType: 'detection',
            detectionDateTime,
            numberCars,
            sensorKilometer
        };

        // Añadir la resolución a los datos y cambiar de zona a unico punto, hacer el flujo en cuanto a cada sensor junto con un agregador
    
        if(direction === 'ascendent'){
            detection.direction = 'ASCENDENT';
        }else{
            detection.direction = 'DESCENDENT';
        }

        await ctx.stub.putState(detectionNumber, Buffer.from(JSON.stringify(detection)));
    }
    
    async calculateFlow(ctx, calculationNumber, streetId, fromDate, numberSensors) {
        let toDate = Date.now();

        let res = [];
        let bySection = [];
        let totalDetections = 0;
        let total = 0;
        for(let j=1; j<=numberSensors; j++){
            res.push(await this.queryCalculate(ctx, fromDate, toDate, j));
            let detections = await JSON.parse(res[j-1].toString());
            let numberCars = 0;
            for(let i=0; i< detections.length; i++){
                numberCars +=  parseInt(detections[i].Record.numberCars);
            }
            bySection.push(parseFloat(((numberCars *1000) /  (toDate - fromDate)).toFixed(3)));
            total += parseFloat(((numberCars *1000) /  (toDate - fromDate)).toFixed(3));
            totalDetections += numberCars;
        }
        
        const carFlow = {
            streetId,
            docType: 'carflow',
            dateFlow: {
                fromDate,
                toDate
            },
            carsPerSecond: {
                bySection,
                total: total/numberSensors
            },
            totalDetections
        };

        let totalBeginHR = process.hrtime();
        let totalBegin = totalBeginHR[0] * 1000000 + totalBeginHR[1] / 1000;

        await ctx.stub.putState(calculationNumber, Buffer.from(JSON.stringify(carFlow)));

        let totalEndHR = process.hrtime()
        let totalEnd = totalEndHR[0] * 1000000 + totalEndHR[1] / 1000;
        let totalDuration = (totalEnd - totalBegin) / 1000;

        let event = {
            totalDetections: totalDetections,
            type: 'calculateFlow',
            execDuration: totalDuration,
            carsPerSecondSection: bySection,
            carsPerSecondTotal: total/numberSensors

        };
        await ctx.stub.setEvent('FlowEvent', Buffer.from(JSON.stringify(event)));
    }
    
    async queryDetectionsInRange(ctx,startDate, endDate) {
    
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startDate, endDate)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }
    
    async queryCalculate(ctx, fromDate, toDate, numberSensor) {
    
        let queryString = `{
            "selector": {
                "sensor": {
                    "$eq": ${numberSensor}
                },
                "detectionDateTime": {
                    "$lte": ${toDate}, 
                    "$gte": ${fromDate}
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
    
        // eslint-disable-next-line no-constant-condition
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

module.exports = Street_network;
