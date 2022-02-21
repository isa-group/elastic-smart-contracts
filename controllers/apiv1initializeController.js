'use strict'

var apiv1initializeController = require('./apiv1initializeControllerService');

module.exports.initialize = function initialize(req, res, next) {
  apiv1initializeController.initialize(req.swagger.params, res, next);
};
