# Governify-Commons
[![NPM](https://nodei.co/npm/governify-commons.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/governify-commons/)

This module is intended for use in all microservices of Governify infrastructure.
It allows for abstract the functions that are mostly used in the code, to have a better control and parametrize the functions call.

Currently Governify-Commons implements the following:
- Governify infrastructure urls management
- A httpClient that should be used for all the calls (This httpClient is an Axios wrapper)
- A logger able to rotate files and change logging levels in execution time
- A configuration manager compatible with local or external files
- Utils functions commonly used in all the microservices

It also features a middleware in /commons to modify configuration parameters and show microservice information.

# Implementations

The module should be initiated at the entrypoint of the service as soon as possible in the code with:
```javascript
const governify = require('governify-commons')
```

After that, you must call the module init function that will load the infrastructure and all the configurations:
```javascript
governify.init().then(function(commonsMiddleware) {
    //All the code for initializing the microservice
    }
);
```

This example is for running without any configuration in it. Also the commons Middleware will be resolved for it to be instantiated in the server. This is explained in the last part of this article.

Once you have called the init function, you can require governify in other classes of your microservice without having to initialize it again.

**If you require governify-commons before the init function being completed, the infrastructure urls or the configuration can have null values.**

## infrastructure

   In order to call another service in the infrastructure you must implement the code as following:
```javascript
const governify = require('governify-commons');
governify.infrastructure.getService('internal.registry').get('/echo/');
governify.infrastructure.getService('internal.registry').post('/echo/', {body}, {config});
```

You can also get only the service url with:
```javascript
const governify = require('governify-commons');
governify.infrastructure.getServiceURL('external.registry')
//This returns the service url that is stored in the loaded infrastructure file as (external.registry)
```
      

## httpClient

If you want to call a service that is not specified in the infrastructure file, you should use the httpClient as follows:

```javascript
const governify = require('governify-commons');
governify.httpClient.get('http://api-echo.herokuapp.com/echo/');
```

 The syntax is the same as axios, the code above is the equivalent of:

```javascript
const axios = require('axios');
axios.get('http://api-echo.herokuapp.com/echo/');
```
    
You can read axios documentation to see all the posible functions:
[Axios NPM documentation](https://www.npmjs.com/package/axios)

## logger

Governify Commons integrates a logger consisting in 5 different logging levels and integrating automatic file rotation. The logger is obtained by executing the getLogger() function from the commons instantiation.

```javascript
const logger = require('governify-commons').getLogger();

logger.debug("Debug message");
logger.info("Info message");
logger.warn("Warn message");
logger.error("Error message");
logger.fatal("Fatal error message");
```


Messages can be tagged by marking the logger object with .tag(tagName) function and store this configuration in the variable or in the actual logging call:

```javascript
const logger = require('governify-commons').getLogger().tag("tag1");

// Will log a message tagged with "tag1"
logger.info("Info message");

// Will log a message tagged with both "tag1" and "tag2" tags
logger.tag("tag2").warn("Warn message");

// Will log a message only tagged with "tag1" because the logger also tagged with tag2 wasn't stored in the logger variable
logger.error("Error message");
```

```
OUTPUT

[2021-07-06T09:06:17.395Z] [info ] [NOTRA] [tag1] Info message
[2021-07-06T09:06:17.397Z] [warn ] [NOTRA] [tag1, tag2] Warn message
[2021-07-06T09:06:17.398Z] [error] [NOTRA] [tag1] Error message
```

## configurator

In order to load a configuration to the module, you have to specify it in the init function:

```javascript
governify.init({
    configurations: [
        {
            name: 'configName',
            location: './configurations/configName.' + (process.env.NODE_ENV || 'development') + '.yaml',
            default: true
        }
    ]
}).then(function (commonsMiddleware) {
    //All the code for initializing the microservice
}
);
```

After that you can load the configuration as follows:

```javascript
let config = governify.configurator.getConfig('configName');
 ``` 

 All the values of the configurations can be replace with Environment variables. 
 For example:
 With a config named 'exampleConfig' and the following value:


```yaml
test:
    childrenTest: originalValue
serverPort: 8080
```   

In order to replace a value of this config, you can specify the following env vars:


```
GOV_CONFIG_exampleConfig_test_childrenTest=replacedValue
GOV_CONFIG_exampleConfig_serverPort=9000
```

The result config when you execute the code will be:
```javascript
governify.configurator.getConfig('configName');
```    
Result:

```yaml
test:
    childrenTest: replacedValue
serverPort: 9000
```
    

## utils

The most used functions of the utils are:
```javascript
const governify = require('governify-commons');
//This function read the content of a file in a local storage path or from a external url
let object = governify.utils.loadObjectFromFileOrURL(url or fileLocation);
```
    
You can check utils.js file to see all posible functions.

# Middleware

By calling the init function, it resolves a middleware. It will serve a set of functions in the /commons endpoint. Make sure it is used after required middlewares for the correct functioning of the server are already instantiated like the body parser and cors if needed.

```javascript
app.use(
    bodyParser.urlencoded({
        limit: '50mb',
        extended: 'true'
    })
);

app.use(
    bodyParser.json({
        limit: '50mb',
        type: 'application/json'
    })
);

app.use(cors());
app.use(commonsMiddleware);
```

These are the available endpoints:
 - `[GET] /commons` - Returns information about the microservice commons is running on, such as the name and version of the microservice, the version of the commons installed and if the requests are being logged.
 - `[GET] /commons/infrastructure` - Returns the services infrastructure in a JSON format.
 - `[POST] /commons/infrastructure/update` - Updates the microservice infrastructure by requesting the infrastructure.yaml file again.
 - `[GET] /commons/requestlogging` - Answers with an "Enabled" or "Disabled" message indicating if commons is loggin the requests information.
 - `[POST] /commons/requestlogging/enable` - Enables the request logging.
 - `[POST] /commons/requestlogging/disable` - Disables the request logging.
 - `[POST] /commons/requestlogging/swap` - Inverts the status of the request logging.
 - `[GET] /commons/logger` - Returns the actual logger configuration (levels, file rotation, etc)
 - `[POST] /commons/logger` - Receives a JSON (with the same structure as the GET) to substitute the logger configuration.


# Update and publish

TODO