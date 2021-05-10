/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const Governify2 = require('./lib/governifyContracts2');
const contractName = "governify2";

module.exports.Governify2 = Governify2;
module.exports.contracts = [ Governify2 ];
module.exports.contractName = function(){
    console.log(contractName)
};
