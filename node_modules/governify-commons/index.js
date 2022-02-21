const dotenv = require('dotenv');
dotenv.config();
const loggerClass = require('./logger');
module.exports.getLogger = function (){ return new loggerClass() };

const infrastructure = require('./infrastructure.js');
const utils = require('./utils.js');
const packageFile = require('./package.json');
const httpClient = require('./httpClient');
const configurator = require('./configurator');
const middleware = require('./middleware');
const logger = new loggerClass().tag("commons");
const tracer = require('./tracer');
const periods = require('./periods');


const maxRetries = 10;
const timeoutRetry = 3000;
let currentRetries = 0;

let isReady = false;

const init = async function (governifyConfiguration = {}) {
    if(currentRetries === 0) logger.info('Starting Governify-Commons...')

    try {
        await loadConfigurations(governifyConfiguration.configurations);
        await infrastructure.loadServices();
        logger.info('Governify module loaded correctly. Version: ', packageFile.version);
        isReady = true;
        return middleware.mainMiddleware;
    } catch (err) {
        if (currentRetries < maxRetries) {
            currentRetries++;
            logger.error('Error loading Governify-Commons:', err.message, '- Retrying in', timeoutRetry, 'ms - (', currentRetries, '/', maxRetries, ')');
            await utils.sleepPromise(timeoutRetry);
            return await init(governifyConfiguration);
        }
        logger.fatal("Maximum retries for Commons Init reached. Cannot load Governify Commons.")
        return Promise.reject(new Error('Maximum retries for Commons Init reached. Cannot load Governify Commons.'))
    }
}

async function loadConfigurations(configurations){
    if (configurations){
        await Promise.all(configurations.map(function (config) {
            logger.info('Loading configuration: ', config.name);
            return configurator.loadConfig(config.name, config.location, config.default);
        }))
    }
}

module.exports.infrastructure = infrastructure;
module.exports.utils = utils;
module.exports.httpClient = httpClient;
module.exports.configurator = configurator;
module.exports.init = init;
module.exports.isReady = () => { return isReady };
module.exports.tracer = tracer;
module.exports.periods = periods;
