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

var armadaService = require('../../lib/armadaServiceRenameForCaseSensitivity'),
    userApi = require('../mocks/mockUserApi'),
    service;

var armadaTestHelper = {};

//config
armadaTestHelper.testConfig = {
    httpPort : 10000,
    userApiPort: 10004,
    mongoDbConnectionString : 'mongodb://localhost/tidepool-platform',
    userApi: { serverName: 'armadaService', serverSecret: 'sharedMachineSecret' }
};

//session
armadaTestHelper.sessiontoken = '99406ced-8052-49c5-97ee-547cc3347da6';

armadaTestHelper.createMongoInstance = function(){
    var mongojs = require('mongojs'),
    testDbInstance = mongojs(armadaTestHelper.testConfig.mongoDbConnectionString, ['groups']);
    return testDbInstance;
};

armadaTestHelper.initArmadaService = function(crudHandler, hostGetter){
    service = new armadaServiceRenameForCaseSensitivity(crudHandler, hostGetter ,armadaTestHelper.testConfig);
    service.start();
    userApi.listen(armadaTestHelper.testConfig.userApiPort);
}

armadaTestHelper.stopTestService = function(){
    service.stop();
    userApi.close();
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
        ('members' in group && group.members.length > 0))
        {
            return true;
        } else {
            return false;
        }
};

module.exports = armadaTestHelper;
