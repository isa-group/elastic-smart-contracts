'use strict'

var apiv1startupController = require('./apiv1startupControllerService');

module.exports.startup = function startup(req, res, next) {
  apiv1startupController.startup(req.swagger.params, res, next);
};
