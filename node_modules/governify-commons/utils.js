
const YAML = require('yaml');
const fs = require('fs');
const governify = require('./index');
var requireFromString = require('require-from-string');
const package = JSON.parse(fs.readFileSync(__dirname + '/../../package.json'));


module.exports = {
    loadObjectFromFileOrURL: loadObjectFromFileOrURL,
    unfoldObject: unfoldObject,
    getTextBetween: getTextBetween,
    requireFromString: requireFromString,
    requireFromFileOrURL: requireFromFileOrURL,
    sleepPromise: sleepPromise,
    getServiceName: getServiceName
}

function getServiceName(){
   return package.name
}

async function sleepPromise(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function requireFromFileOrURL(fileOrUrl) {
    let src = await loadObjectFromFileOrURL(fileOrUrl);
    return requireFromString(src);
}

//TODO: new methods to read only the content without parse as a object (for js and other files)
async function loadObjectFromFileOrURL(fileOrURL) {
    try {
        let result;
        if (fileOrURL.startsWith('http://') || fileOrURL.startsWith('https://')) {
            let requestFile = await governify.httpClient.get(fileOrURL);
            result = requestFile.data;
        } else
            result = await fs.readFileSync(fileOrURL, 'utf8');

        if (fileOrURL.endsWith('.yaml') || fileOrURL.endsWith('.yml'))
            result = YAML.parse(result);

        return result;
    } catch (error) {
        throw Error('Error requesting file from: ' + fileOrURL + ' ERROR: ' + error)
    }
}


// function getPropertyFromString(object, property) {
//     let propertyResult = property.split('.').reduce(function (p, prop) { return p[prop] }, object);
//     return propertyResult.default ? propertyResult.default : propertyResult;
// }

// function setPropertyFromString(object, property) {
//     let propertyResult = property.split('.').reduce(function (p, prop) { return p[prop] }, object);
//     return propertyResult.default ? propertyResult.default : propertyResult;
// }


function getTextBetween(text, betweenStart, betweenEnd) {
    let init = text.indexOf(betweenStart);
    let end = text.indexOf(betweenEnd);
    if (init != -1 && end != -1 && init < end) {
        return text.substr(init + 1, end - init - 1);
    } else {
        return null;
    }
}

//Unfold a object to only 1 level variables
function unfoldObject(input) {
    function flatten(obj) {
        var result = {},
            f,
            key,
            keyf;

        for (key in obj) {
            if (obj[key] instanceof Array) {
                obj[key].forEach(function (k) {
                    f = flatten(k);
                    for (keyf in f) {
                        result[key + '.' + keyf] = f[keyf];
                    }
                    output.push(JSON.parse(JSON.stringify(result))); //poor man's clone object
                });
            } else if (obj[key] instanceof Object) {
                f = flatten(obj[key]);
                for (keyf in f) {
                    result[key + '_' + keyf] = f[keyf];
                }
            } else {
                result[key] = obj[key];
            }
        }
        return result;
    } //flatten
    var output = [];
    return flatten(input);
} //unfold