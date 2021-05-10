/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const Governify = require('./lib/governifyContracts');
const contractName = "governify";

module.exports.Governify = Governify;
module.exports.contracts = [ Governify ];
module.exports.contractName = function(){
    console.log(contractName)
};