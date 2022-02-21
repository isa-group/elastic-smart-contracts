const governify = require('../index');
const utils = require('../utils');
const http = require('http');
const express = require('express');
const assert = require('assert')
const app = express();
const serverPort = 9095;
const logger = governify.getLogger().tag("metrics");
let server;
// const sinon = require('sinon');
// sinon.stub(console)

describe("Governify Commons initialization", function () {
    before("Init server with commons", function (done) {
        governify.init({}).then(commonsMiddleware => {
            app.use(commonsMiddleware)
            server = http.createServer(app)
            server.listen(12500, function () {
                console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);

            });
            done();
        }).catch(err => {
            console.error(err)
            done(err);
        })
    })
    it("Check services are not empty", function () {
        assert.notStrictEqual(governify.infrastructure.getServices().internal, null)
        assert.notStrictEqual(governify.infrastructure.getServices().external, null)
    });

    it("Check HTTP request are working", function (done) {

        governify.httpClient.get("http://localhost:12500/404endpoint").then(resp => {
           done(new Error("404 endpoint should not exist."))
        }).catch(err => {
            assert.strictEqual(err.response.status, 404);
            done();
        }).catch(done)
    });

    it("Check Commons middleware is inserted", function (done) {
        governify.httpClient.get("http://localhost:12500/commons").then(resp => {
            assert.strictEqual(resp.data.serviceName, require('../package.json').name)
            assert.strictEqual(resp.data.version, require('../package.json').version)
            done()
        }).catch(done)
    });



    after("Close server", function () {
        server.close();
    })

})