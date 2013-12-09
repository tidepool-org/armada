'use strict';

var restify,
server,
log;

restify = require('restify');

log = require('./log.js')('ArmardaService.js');

server = restify.createServer({
    name: 'TidepoolGroups'
});

server.use(restify.fullResponse());
server.use(restify.bodyParser());
server.use(restify.queryParser());

function stop(crudHandler,port) {
    log.info('Stopping the Groups API server');
    server.close();
}

function start(crudHandler,port) {
    //bind routes
    var groups = require('./routes/GroupsRoute')(crudHandler);

    server.post('/api/group/create', groups.addGroup);
    server.get('/api/group/memberof/:userid',groups.memberOf);
    server.get('/api/group/ownerof/:userid',groups.ownerOf);
    server.get('/api/group/patient/:userid',groups.patientIn);
    //listening
    log.info('Groups API server serving on port[%s]', port);
    server.listen(port);
}

// *******************************************************
exports.start = start;
exports.stop = stop;
exports.server = server;