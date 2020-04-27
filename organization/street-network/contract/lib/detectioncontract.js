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
     * Issue  detection
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer  detection issuer
     * @param {Integer} detectionNumber detection number for this issuer
     * @param {String} issueDateTime detection issue date
     * @param {String} maturityDateTime detection maturity date
     * @param {Integer} faceValue face value of detection
    */
    async issue(ctx, issuer, detectionNumber, detectionDateTime) {

        // create an instance of the detection
        let detection = Detection.createInstance(detectionNumber, detectionDateTime);

        // Smart contract, rather than detection, moves detection into ISSUED state
        detection.setIssued();

        // Add the detection to the list of all similar  detections in the ledger world state
        await ctx.detectionList.addDetection(detection);

        // Must return a serialized detection to caller of smart contract
        return detection;
    }

    /**
     * Buy  detection
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer  detection issuer
     * @param {Integer} detectionNumber detection number for this issuer
     * @param {String} currentOwner current owner of detection
     * @param {String} newOwner new owner of detection
     * @param {Integer} price price paid for this detection
     * @param {String} purchaseDateTime time detection was purchased (i.e. traded)
    */
    async buy(ctx, issuer, detectionNumber, currentOwner, newOwner, price, purchaseDateTime) {

        // Retrieve the current detection using key fields provided
        let detectionKey = Detection.makeKey([issuer, detectionNumber]);
        let detection = await ctx.detectionList.getDetection(detectionKey);

        // Validate current owner
        if (detection.getOwner() !== currentOwner) {
            throw new Error('Detection ' + issuer + detectionNumber + ' is not owned by ' + currentOwner);
        }

        // First buy moves state from ISSUED to TRADING
        if (detection.isIssued()) {
            detection.setTrading();
        }

        // Check detection is not already REDEEMED
        if (detection.isTrading()) {
            detection.setOwner(newOwner);
        } else {
            throw new Error('Detection ' + issuer + detectionNumber + ' is not trading. Current state = ' +detection.getCurrentState());
        }

        // Update the detection
        await ctx.detectionList.updateDetection(detection);
        return detection;
    }

    /**
     * Redeem  detection
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer  detection issuer
     * @param {Integer} detectionNumber detection number for this issuer
     * @param {String} redeemingOwner redeeming owner of detection
     * @param {String} redeemDateTime time detection was redeemed
    */
    async redeem(ctx, issuer, detectionNumber, redeemingOwner, redeemDateTime) {

        let detectionKey = Detection.makeKey([issuer, detectionNumber]);

        let detection = await ctx.detectionList.getDetection(detectionKey);

        // Check detection is not REDEEMED
        if (detection.isRedeemed()) {
            throw new Error('Detection ' + issuer + detectionNumber + ' already redeemed');
        }

        // Verify that the redeemer owns the  detection before redeeming it
        if (detection.getOwner() === redeemingOwner) {
            detection.setOwner(detection.getIssuer());
            detection.setRedeemed();
        } else {
            throw new Error('Redeeming owner does not own detection' + issuer + detectionNumber);
        }

        await ctx.detectionList.updateDetection(detection);
        return detection;
    }

}

module.exports = DetectionContract;
