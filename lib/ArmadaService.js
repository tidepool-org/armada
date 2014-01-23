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
    crud,
    servicePort;

restify = require('restify');

log = require('./log.js')('armadaService.js');

var armadaService = function(crudHandler,envConfig) {

    crud = crudHandler;

    //create the server depnding on the type
    if (envConfig.httpPort != null) {
        servicePort = envConfig.httpPort;
        createServer({ name: 'TidepoolUserHttp' });
    }

    if (envConfig.httpsPort != null) {
        servicePort = envConfig.httpsPort;
        createServer(_.extend({ name: 'TidepoolUserHttps'}));
    }

    //enable discovary 
    setupHakken(envConfig);

    return {
        stop : stopService,
        start : startService
    };

};

/*
    HAKKEN SETUP - for service discovery
*/
function setupHakken(envConfig){
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


function createServer(config){
    log.info('Creating server[%s]', config.name);
    server = restify.createServer(config);
    server.use(restify.queryParser());
    server.use(restify.bodyParser());

    var groups = require('./routes/groupsApi')(crud);

    //health check
    server.get('/api/group/status',groups.status);

    //membership
    server.get('/api/group/membership/:userid/member',groups.memberOf);

    //updating
    server.post('/api/group', groups.addGroup);
    server.post('/api/group/:groupid/user',groups.addToGroup);
    server.del('/api/group/:groupid/user',groups.removeFromGroup);
    
    //group
    server.get('/api/group/:groupid/members',groups.getAllInGroup);
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