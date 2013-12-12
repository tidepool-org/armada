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
var TestingSetup = function(crudHandler,port,integrationTest) {

    isIntegration = integrationTest;

    if(isIntegration){
        testDbInstance = mongojs('mongodb://localhost/tidepool-platform', ['groups']);
    }
    servicePort = port;

    service = new ArmadaService(crudHandler,servicePort);
    service.start();
    this.stopService = stopTestService;
    this.mongoInstance = getMongoInstance;
    this.mongoId = getMongoId;
    this.checkId = isValidId;
    this.checkGroup = isValidGroup;
    this.localhostEndpoint = getLocalhostEndpoint;

};

function stopTestService(){
    service.stop();
}

function getMongoId(){
    if(isIntegration){
        return mongojs.ObjectId().toString();
    }
    return false;
}

function isValidGroup(group){
    
    if (('id' in group && isValidId(group.id)) &&
    ('name' in group && group.name !== '') &&
    ('owners' in group && group.owners.length > 0) &&
    ('members' in group && group.members.length > 0) &&
    ('patient' in group && group.patient !== '')) 
    {
        return true;
    } else {
        return false;
    }
}

function isValidId(idString){
    if(isIntegration){
        try{
            mongojs.ObjectId(idString);
            return true;
        }
        catch(error){
            return false;
        }
    }
    return false;
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

module.exports = TestingSetup;
