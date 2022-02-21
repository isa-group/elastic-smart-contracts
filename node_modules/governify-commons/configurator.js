const governify = require('./index');
const _ = require('lodash');

let configs = {};
let defaultConfig = '';

module.exports.loadConfig = loadConfig;
module.exports.getConfig = getConfig;

async function loadConfig(name, location, isDefault) {
    let newConfig = await governify.utils.loadObjectFromFileOrURL(location);
    //Get all replacements for the config from env vars
    Object.keys(process.env).filter(envVarKey => {
        return envVarKey.startsWith('GOV_CONFIG_' + name + '_');
    }).forEach(envVarKey => {
        _.set(newConfig, envVarKey.replace('GOV_CONFIG_' + name + '_', '').replace(/_/g, '.'), process.env[envVarKey]);
    });

    //Store config
    configs[name] = newConfig;
    if (isDefault) {
        defaultConfig = name;
    }
    return newConfig;
}


function getConfig(name) {
    return name ? configs[name] : configs[defaultConfig];
}