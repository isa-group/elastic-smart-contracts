'use strict'

var apiv1setUpagreementController = require('./apiv1setUpagreementControllerService');

module.exports.setUpAgreement = function setUpAgreement(req, res, next) {
  apiv1setUpagreementController.setUpAgreement(req.swagger.params, res, next);
};