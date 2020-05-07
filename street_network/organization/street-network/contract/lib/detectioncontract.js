/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// DetectionNet specifc classes
const Detection = require('./detection.js');
const DetectionList = require('./detectionlist.js');

/**
 * A custom context provides easy access to list of allyy detections
 */
class DetectionContext extends Context {

    constructor() {
        super();
        // All detections are held in a list of detections
        this.detectionList = new DetectionList(this);
    }

}

/**
 * Define  detection smart contract by extending Fabric Contract class
 *
 */
class DetectionContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.detectionnet.detection');
    }

    /**
     * Define a custom context for  detection
    */
    createContext() {
        return new DetectionContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Add  detection
     *
     * @param {Context} ctx the transaction context
     * @param {Integer} streetId
     * @param {Integer} detectionNumber 
     * @param {Integer} detectionKilometer
     * @param {Integer} detectionLatitude 
     * @param {Integer} detectionLongitude
     * @param {String} direction  
    */
    async addDetection(ctx, streetId, detectionNumber, detectionKilometer, detectionLatitude, detectionLongitude, direction) {
        let detectionDateTime = new Date().toLocaleString();

        // create an instance of the detection
        let detection = Detection.createInstance(streetId, detectionNumber, detectionDateTime, detectionKilometer, detectionLatitude, detectionLongitude);

        if(direction === 'ascending'){
            detection.setAscending();
        }else{
            detection.setDescending();
        }


        // Add the detection to the list of all similar  detections in the ledger world state
        await ctx.detectionList.addDetection(detection);

        // Must return a serialized detection to caller of smart contract
        return detection;
    }


    async createDetection(ctx, streetId, detectionNumber, detectionKilometer, detectionLatitude, detectionLongitude, direction) {
        let detectionDateTime = Date.now();

        const detection = {
            streetId,
            docType: 'detection',
            detectionNumber,
            detectionKilometer,
            detectionLatitude,
            detectionLongitude,
        };

        if(direction === 'ascending'){
            detection.setAscending();
        }else{
            detection.setDescending();
        }
        await ctx.stub.putState(detectionDateTime, Buffer.from(JSON.stringify(detection)));
        let indexName = 'street~kilometer'
        let streetKilometerIndexKey = await stub.createCompositeKey(indexName, [detection.streetId, detection.detectionKilometer]);
        console.info(colorNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(streetKilometerIndexKey, Buffer.from('\u0000'));

    }

    async calculate(ctx, streetId, direction, detectionKilometerMax, detectionKilometerMin, detectionDateTimeMin, detectionDateTimeMax) {
        let detections = this.queryCalculate(ctx, streetId, direction, detectionKilometerMax, detectionKilometerMin, detectionDateTimeMin, detectionDateTimeMax);

        let carPerSeconds = (await detections).length  ((detectionDateTimeMax - detectionKilometerMin)/1000);


        const detectionData = {
            streetId: streetId,
            direction: direction,
            fromKilometer: detectionKilometerMin,
            toKilometer: detectionKilometerMax,
            dateCalculated: new Date(detectionDateTimeMax).toLocaleString(),
            carPerSeconds: carPerSeconds,
        }

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

    /**
     * 
     *
     * @param {Context} ctx the transaction context
     * @param {String} currentState 
     * @param {String} direction
     * @param {Integer} detectionKilometerMin
     * @param {Integer} detectionKilometerMax
     * @param {Integer} detectionDateTimeMin
     * @param {Integer} detectionDateTimeMax
    */
    async queryCalculate(ctx, streetId, direction, detectionKilometerMax, detectionKilometerMin, detectionDateTimeMin, detectionDateTimeMax) {

        let state = parseInt(currentState);

        let queryString = {
            selector: {
                streetId: streetId,
                direction: direction,
                detectionKilometer: {
                    $lte: detectionKilometerMax,
                    $gte: detectionKilometerMin
                },
                detectionDateTime: {
                    $lte: detectionDateTimeMax,
                    $gte: detectionDateTimeMin          
                }


            }
        };

        let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
        return queryResults;

    }


    /**
     * Evaluate a queryString
     *
     * @param {Context} ctx the transaction context
     * @param {String} queryString the query string to be evaluated
    */
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

module.exports = DetectionContract;
