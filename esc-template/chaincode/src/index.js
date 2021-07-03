
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
    * Submit the new data given to the blockchain.
    * @async
    * @param {object} params - An object with all the parameters necessary which are the id of the data storage, the array of data to introduce,
    * the current time window for the data and the frequency to harvest data.
    */
    async updateData(ctx, params) {

        // UPDATE ASSETS LOGIC

    }


    /**
    * Analyses data and submits the result to the blockchain.
    * @async
    * @param {object} params - An object with all the parameters necessary which are the calculation storage, the dates from which collect data
    * to analyse it, the number of sensors in the street, the current time window for the data and the current frequency.
    */
    async analysis(ctx, params) {

        // ANALYTICS LOGIC


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

        // EVALUATE HISTORY LOGIC

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

        // EVALUATE FREQUENCY  LOGIC
    }



}

module.exports = analytics_chaincode;
