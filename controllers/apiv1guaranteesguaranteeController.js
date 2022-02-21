'use strict'

var apiv1guaranteesguaranteeController = require('./apiv1guaranteesguaranteeControllerService');

module.exports.guarantee = function guarantee(req, res, next) {
  apiv1guaranteesguaranteeController.guarantee(req.swagger.params, res, next);
};
