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

    /*
    /group/memberof -- gets groups this user is a member of
    /group/ownerof -- gets groups this user owns (for group management)
    /group/patient -- gets groups referring to this user as a patient
    /group/create -- creates a group owned by this user
    /group/adduser/:groupid -- adds a user to a group this user owns
    /group/deluser/:groupid -- deletes a user from a group this user owns
    /groups/getpatient/:groupid -- get the patient associated with a given group
    /groups/members/:groupid -- get the users and groups listed in the group (does not iterate into subgroups)
    /groups/allusers/:groupid -- resolves a group recursively into its list of unique users
    */

    server.post('/api/group/create', groups.addGroup);
    server.get('/api/group/memberof/:userid',groups.memberOf);
    server.get('/api/group/ownerof/:userid',groups.ownerOf);
    server.get('/api/group/patient/:userid',groups.patientIn);

    server.post('/api/group/adduser/:groupid',groups.addToGroup);
    server.post('/api/group/deluser/:groupid',groups.removeFromGroup);
    //listening
    log.info('Groups API server serving on port[%s]', port);
    server.listen(port);
}

// *******************************************************
exports.start = start;
exports.stop = stop;
exports.server = server;