'use strict'

var apiv1logsController = require('./apiv1logsControllerService');

module.exports.getLogs = function getLogs(req, res, next) {
  apiv1logsController.getLogs(req.swagger.params, res, next);
};
