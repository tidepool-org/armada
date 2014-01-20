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

var armadaService = function(crudHandler,port) {

    crud = crudHandler;
    servicePort = port;

    server = restify.createServer({
        name: 'TidepoolGroups'
    });

    server.use(restify.fullResponse());
    server.use(restify.bodyParser());
    server.use(restify.queryParser());

    return {
        stop : stopService,
        start : startService
    };

};

function stopService() {
    log.info('Stopping the Groups API server');
    server.close();
}

function startService() {
    log.info('Start groups API server serving on port[%s]', servicePort);
    var groups = require('./routes/groupsRoute')(crud);

    //health check
    server.get('/api/group/status',groups.status);
    server.get('/api/group/echo',groups.echo);
    server.put('/api/group/echo',groups.echo);
    server.post('/api/group/echo',groups.echo);
    server.del('/api/group/echo',groups.echo);

    //membership
    server.get('/api/group/membership/:userid/member',groups.memberOf);
    server.get('/api/group/membership/:userid/owner',groups.ownerOf);
    server.get('/api/group/membership/:userid/patient',groups.patientIn);

    //updating
    server.post('/api/group', groups.addGroup);
    server.post('/api/group/:groupid/user',groups.addToGroup);
    server.del('/api/group/:groupid/user',groups.removeFromGroup);
    
    //group
    server.get('/api/group/:groupid/patient',groups.patientForGroup);
    server.get('/api/group/:groupid/members',groups.getAllInGroup);
    server.get('/api/group/:groupid/allusers',groups.getAllUsers);
    
    server.listen(servicePort);
}

module.exports = armadaService;