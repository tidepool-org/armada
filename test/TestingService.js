'use strict';

var ArmadaService = require('../lib/ArmadaService'),
    mongojs = require('mongojs'),
    testDbInstance,
    servicePort,
    isIntegration,
    service;

/*
    Setup for testing
*/
var TestingService = function(crudHandler,port,integrationTest) {

    isIntegration = integrationTest;

    if(isIntegration){
        testDbInstance = mongojs('mongodb://localhost/tidepool-platform', ['groups']);
    }
    servicePort = port;

    service = new ArmadaService(crudHandler,servicePort);
    service.start();
    this.stopService = stopTestService;
    this.mongoInstance = getMongoInstance;
    this.localhostEndpoint = getLocalhostEndpoint;

};

function stopTestService(){
    service.stop();
}

function getMongoInstance(){
    if(isIntegration){
        return testDbInstance;
    }
    return false;
}

function getLocalhostEndpoint(){
    return 'http://localhost:'+servicePort;
}

module.exports = TestingService;
