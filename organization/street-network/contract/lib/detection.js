/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

/**
 * Detection class extends State class
 * Class will be used by application and smart contract to define a car detection
 */
class Detection extends State {

    constructor(obj) {
        super(Detection.getClass(), [obj.detectionNumber]);
        Object.assign(this, obj);
    }


    static fromBuffer(buffer) {
        return Detection.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to car detection
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, Detection);
    }

    /**
     * Factory method to create a car detection object
     */
    static createInstance(detectionNumber, detectionDateTime) {
        return new Detection({ detectionNumber, detectionDateTime });
    }

    static getClass() {
        return 'org.streetnet.detection';
    }
}

module.exports = Detection;
