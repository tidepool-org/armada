/*
== BSD2 LICENSE ==
Copyright (c) 2014, Tidepool Project

This program is free software; you can redistribute it and/or modify it under
the terms of the associated License, which is identical to the BSD 2-Clause
License as published by the Open Source Initiative at opensource.org.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the License for more details.

You should have received a copy of the License along with this program; if
not, you can obtain one from Tidepool Project at tidepool.org.
== BSD2 LICENSE ==
 */

'use strict';

var armadaService = require('../../lib/armadaService'),
    mongojs = require('mongojs'),
    testDbInstance,
    servicePort,
    isIntegration,
    service,
    testConfig;

/*
    Setup for testing
*/
var testingHelper = function(integrationTest) {

    isIntegration = integrationTest;

    testConfig = {
        httpPort : 10000,
        mongoDbConnectionString : 'mongodb://localhost/tidepool-platform' 
    };

    servicePort = testConfig.httpPort;

    if(isIntegration){
        testDbInstance = mongojs(testConfig.mongoDbConnectionString, ['groups']);
    }

    return {
        initArmadaService : initArmadaService,
        stopArmadaService : stopTestService,
        mongoTestInstance : getMongoInstance,
        testConfig: getTestConfig,
        createMongoId : getMongoId,
        validateId : isValidId,
        validateGroup : isValidGroup,
        armadaServiceEndpoint : getLocalhostEndpoint
    };
    
};

function getTestConfig(){
    return testConfig;
}

function initArmadaService(crudHandler){
    service = new armadaService(crudHandler,testConfig);
    service.start();
}

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
    try{
        mongojs.ObjectId(String(idString));
        return true;
    }
    catch(error){
        console.log('error with id string ',error);
        return false;
    }
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

module.exports = testingHelper;
