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

var restify,
    server,
    log,
    servicePort;

restify = require('restify');

log = require('./log.js')('armadaService.js');

var armadaService = function(crudHandler, userApiHostGetter, envConfig) {

    //create the server depnding on the type
    if (envConfig.httpPort != null) {
        servicePort = envConfig.httpPort;
        createServer({ name: 'TidepoolUserHttp' },envConfig,crudHandler,userApiHostGetter);
    }

    if (envConfig.httpsPort != null) {
        servicePort = envConfig.httpsPort;
        createServer(_.extend({ name: 'TidepoolUserHttps'},envConfig,crudHandler,userApiHostGetter));
    }

    //enable discovary 
    setupGroupsForDiscovery(envConfig);

    return {
        stop : stopService,
        start : startService
    };

};

/*
    HAKKEN SETUP - for service discovery
*/
function setupGroupsForDiscovery(envConfig){
    if (envConfig.discovery != null) {
        var serviceDescriptor = { service: envConfig.serviceName };
        if (envConfig.httpsPort != null) {
            serviceDescriptor['host'] = envConfig.publishHost + ':' + envConfig.httpsPort;
        }
        else if (envConfig.httpPort != null) {
            serviceDescriptor['host'] = envConfig.publishHost + ':' + envConfig.httpPort;
            serviceDescriptor['protocol'] = 'http';
        }

        var hakken = require('hakken')(envConfig.discovery).client.make();
        hakken.start();
        hakken.publish(serviceDescriptor);
    }
}

function createServer(serverConfig, envConfig, crudHandler, userApiHostGetter){
    log.info('Creating server[%s]', serverConfig.name);
    server = restify.createServer(serverConfig);
    server.use(restify.queryParser());
    server.use(restify.bodyParser());

    var groupApi = require('./routes/groupApi')(crudHandler);
    var userApi = require('./routes/userApi')(envConfig, userApiHostGetter);

    //health check
    server.get('/api/group/status',groupApi.status);

    //user membership
    server.get('/api/group/membership/:userid/member', userApi.checkToken, userApi.getToken, groupApi.memberOf);

    //updating
    server.post('/api/group', userApi.checkToken, userApi.getToken, groupApi.addGroup);

    server.post('/api/group/:groupid/user', userApi.checkToken, userApi.getToken, groupApi.addToGroup);
    server.del('/api/group/:groupid/user', userApi.checkToken, userApi.getToken, groupApi.removeFromGroup);
    
    //group members
    server.get('/api/group/:groupid/members', userApi.checkToken, userApi.getToken, userApi.getAllUsersForGroup);

}

function stopService() {
    log.info('Stopping the Groups API server');
    server.close();
}

function startService() {
    log.info('Start Groups API server serving on port[%s]', servicePort);
    server.listen(servicePort);
}

module.exports = armadaService;