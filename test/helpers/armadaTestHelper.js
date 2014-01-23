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
    service;

var armadaTestHelper = {};

//config
armadaTestHelper.testConfig = {
    httpPort : 10000,
    mongoDbConnectionString : 'mongodb://localhost/tidepool-platform',
    serverName: 'armadaService',
    serverSecret: 'sharedMachineSecret'
};

//session
armadaTestHelper.sessiontoken = '99406ced-8052-49c5-97ee-547cc3347da6';

armadaTestHelper.createMongoInstance = function(){
    var mongojs = require('mongojs'),
    testDbInstance = mongojs(armadaTestHelper.testConfig.mongoDbConnectionString, ['groups']);
    return testDbInstance;
};

armadaTestHelper.initArmadaService = function(crudHandler){
    service = new armadaService(crudHandler,armadaTestHelper.testConfig);
    service.start();
}

armadaTestHelper.stopTestService = function(){
    service.stop();
}

armadaTestHelper.testServiceEndpoint = function(){
    return 'http://localhost:'+armadaTestHelper.testConfig.httpPort;
}

armadaTestHelper.isValidId = function(id){
    if(id){
        return true;
    }
    return false;
}

armadaTestHelper.validateGroup = function(group){
    if (('id' in group && armadaTestHelper.isValidId(group.id)) &&
        ('name' in group && group.name !== '') &&
        ('owners' in group && group.owners.length > 0) &&
        ('members' in group && group.members.length > 0) &&
        ('patient' in group && group.patient !== ''))
        {
            return true;
        } else {
            return false;
        }
};

module.exports = armadaTestHelper;
