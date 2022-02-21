const httpClient = require('./httpClient');
const infrastructure = require('./infrastructure');
const package = require(__dirname + '/../../package.json');
const fs = require('fs');
let servicePackage = JSON.parse(fs.readFileSync(__dirname + '/../../package.json'));
const express = require('express');
const tracer = require('./tracer');
const governify = require('./index');
const logger = governify.getLogger();
const logClass = require('./logger');
let mainMiddleware = express.Router();

module.exports.mainMiddleware = mainMiddleware;

mainMiddleware.use(tracer.middlewareTracer)
//mainMiddleware.use(authMiddleware)
mainMiddleware.use('/commons/requestLogging', requestLoggingMiddleware);
mainMiddleware.use('/commons/infrastructure', infrastructureMiddleware);
mainMiddleware.use('/commons/logger', loggerMiddleware);
mainMiddleware.use('/commons', baseMiddleware);


function authMiddleware(req, res, next) {
    let commonsConfig = governify.configurator.getConfig("commons")
    if (commonsConfig.auth) {

    } else {
        next()
    }
}

function baseMiddleware(req, res) {
    if (req.url === '/') {
        res.send({
            title: 'Governify Commons',
            version: package.version,
            requestLogging: httpClient.getRequestLogging() ? 'true' : 'false',
            serviceName: servicePackage.name,
            serviceVersion: servicePackage.version,
        });
        return;
    }
    res.status(400).send('Method not implemented')
}

async function infrastructureMiddleware(req, res) {
    if (req.url === '/') {
        if (req.method === 'GET') {
            try{
                res.send(infrastructure.getServices())
            } catch (err) {
                logger.fatal('Internal error loading infrastructure');
                res.status(500).send('Internal error loading infrastructure, please reload this service: ' + err.message);
            }
            return;
        }
    } else if (req.url.startsWith('/update')) {
        if (req.method === 'POST') {
            await infrastructure.loadServices().then(infrastructure => {
                res.send('Updated infrastructure: ' + JSON.stringify(infrastructure))
            }).catch(err => {
                logger.fatal('Internal error reloading infrastructure');
                res.status(500).send('Internal error reloading infrastructure, please reload this service: ' + err.message);
            });
            return;
        }

    }

    res.status(400).send('Method not implemented')
}

async function requestLoggingMiddleware(req, res) {
    if (req.method === 'POST') {
        if (req.url === '/enable') {
            httpClient.setRequestLogging(true);
            res.send('Enabled');
        }
        else if (req.url === '/disable') {
            httpClient.setRequestLogging(false);
            res.send('Disabled');
        }
        else if (req.url === '/swap') {
            httpClient.setRequestLogging(!httpClient.getRequestLogging());
            res.send(httpClient.getRequestLogging() ? 'Enabled' : 'Disabled');
        } else
            res.status(400).send('Method not implemented');
    }
    else if (req.method === 'GET') {
        res.send(httpClient.getRequestLogging() ? 'Enabled' : 'Disabled');
    }
    else {
        res.status(400).send('Method not implemented');
    }
}

async function loggerMiddleware(req, res) {
    if (req.method === 'POST') {
        if (req.url === '/config') {
            logClass.setLogConfig(req.body);
            res.send('Updated');
        } else
            res.status(400).send('Method not implemented');
    }
    else if (req.method === 'GET') {
        if (req.url === '/config') {
            res.send(logClass.getLogConfig());
        } else
            res.status(400).send('Method not implemented');
    }
    else {
        res.status(400).send('Method not implemented');
    }
}