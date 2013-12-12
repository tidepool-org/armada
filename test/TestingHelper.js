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
var TestingHelper = function(crudHandler,port,integrationTest) {

    isIntegration = integrationTest;

    if(isIntegration){
        testDbInstance = mongojs('mongodb://localhost/tidepool-platform', ['groups']);
    }
    servicePort = port;

    service = new ArmadaService(crudHandler,servicePort);
    service.start();

    return {
        stopArmadaService : stopTestService,
        mongoTestInstance : getMongoInstance,
        createMongoId : getMongoId,
        validateId : isValidId,
        validateGroup : isValidGroup,
        armadaServiceEndpoint : getLocalhostEndpoint
    };
    
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

//do we have all the required feilds we expect in a group
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

//is the id valid given we are using mongo?
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

module.exports = TestingHelper;
