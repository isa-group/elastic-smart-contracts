'use strict'

var apiv1shutdownController = require('./apiv1shutdownControllerService');

module.exports.shutdown = function shutdown(req, res, next) {
  apiv1shutdownController.shutdown(req.swagger.params, res, next);
};
