'use strict'

var apiv1guaranteesagreementguaranteeController = require('./apiv1guaranteesagreementguaranteeControllerService');

module.exports.guarantee = function guarantee(req, res, next) {
  apiv1guaranteesagreementguaranteeController.guarantee(req.swagger.params, res, next);
};
