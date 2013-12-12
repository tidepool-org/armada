'use strict';

var restify,
    server,
    log,
    crud,
    servicePort;

restify = require('restify');

log = require('./log.js')('ArmadaService.js');

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
    var groups = require('./routes/GroupsRoute')(crud);

    server.post('/api/group/create', groups.addGroup);
    
    server.get('/api/group/memberof/:userid',groups.memberOf);
    server.get('/api/group/ownerof/:userid',groups.ownerOf);
    server.get('/api/group/patient/:userid',groups.patientIn);

    server.get('/api/group/getpatient/:groupid',groups.patientForGroup);
    server.get('/api/group/members/:groupid',groups.getAllInGroup);
    server.get('/api/group/allusers/:groupid',groups.getAllUsers);

    server.post('/api/group/adduser/:groupid',groups.addToGroup);
    server.del('/api/group/deluser/:groupid',groups.removeFromGroup);
    
    log.info('Groups API server serving on port[%s]', servicePort);
    server.listen(servicePort);
}

module.exports = armadaService;