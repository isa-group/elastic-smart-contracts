/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('./../ledger-api/statelist.js');

const Detection = require('./detection.js'); 

class DetectionList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.detectionnet.detectionlist');
        this.use(CarDetection);
    }

    async addDetection(detection) {
        return this.addState(detection);
    }

    async getDetection(detectionKey) {
        return this.getState(detectionKey);
    }

    async updateDetection(detection) {
        return this.updateState(detection);
    }
}


module.exports = DetectionList;