/*
 * Copyright (c) 2014, Tidepool Project
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

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
var testingHelper = function(integrationTest) {

    isIntegration = integrationTest;

    if(isIntegration){
        testDbInstance = mongojs('mongodb://localhost/tidepool-platform', ['groups']);
    }

    return {
        initArmadaService : initArmadaService,
        stopArmadaService : stopTestService,
        mongoTestInstance : getMongoInstance,
        createMongoId : getMongoId,
        validateId : isValidId,
        validateGroup : isValidGroup,
        armadaServiceEndpoint : getLocalhostEndpoint
    };
    
};

function initArmadaService(crudHandler,port){
    servicePort = port;
    service = new ArmadaService(crudHandler,servicePort);
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
