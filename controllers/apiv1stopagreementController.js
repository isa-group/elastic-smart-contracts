'use strict'

var apiv1stopagreementController = require('./apiv1stopagreementControllerService');

module.exports.stopAgreement = function stopAgreement(req, res, next) {
  apiv1stopagreementController.stopAgreement(req.swagger.params, res, next);
};