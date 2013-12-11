'use strict';

var log,
settings;

/*
    Handler CRUD opertaions via Mongo instance
*/
var FakeMongoHandler = function(config) {

    log = require('../../lib/log.js')('FakeMongoHandler.js');
    settings = config;

    this.createGroup = handleCreateGroup;
    this.findGroupsPatientIn = handleFindGroupsPatientIn;
    this.findGroupsMemberOf = handleFindGroupsMemberOf;
    this.findGroupsOwnerOf = handleFindGroupsOwnerOf;
    this.addUserToGroup = handleAddUserToGroup;
    this.removeUserFromGroup = handleRemoveUserFromGroup;
    this.findPatientForGroup = handleFindPatientForGroup;
};

function resolveCallbackValues(callback,data){
    
    if (settings.throwErrors){
        return callback(new Error('fake error'),null);        
    }else if (settings.returnNone){
        //if expecting an array return empty array
        if( Object.prototype.toString.call( data ) === '[object Array]' ) {
            return callback(null,[]);
        }
        return callback(null,''); 
    }

    return callback(null,data);
}

function handleCreateGroup (group,callback) {
    log.debug('Create in mongo group[%j]', group);

    return resolveCallbackValues(callback,77777777777);
}

function handleFindGroupsMemberOf(userId,callback) {
    log.debug('Finding groups member of userid[%s]', userId);

    var memberGroups = [
    {
        id: '65587876679870098',
        name : 'medical',
        owners: [userId,'5555'],
        members: [userId,'5555'],
        patient : '12345'
    },
    {
        id: '87987987987897987987',
        name : 'careteam',
        owners: ['3343','8898'],
        members: ['3343','8898'],
        patient : userId
    }];

    return resolveCallbackValues(callback,memberGroups);
}

function handleFindGroupsOwnerOf(userId,callback) {
    log.debug('Finding groups owned by userid[%s]', userId);

    var ownerGroups = [
    {
        id: '65587876679870098',
        name : 'medical',
        owners: [userId,'5555'],
        members: [userId,'5555'],
        patient : '12345'
    },
    {
        id: '87987987987897987987',
        name : 'careteam',
        owners: [userId,'8898'],
        members: [userId,'8898'],
        patient : '9999999'
    }];

    return resolveCallbackValues(callback,ownerGroups);
}

function handleFindGroupsPatientIn(userId,callback) {
    log.debug('Finding groups patient[%s] is in', userId);

    var patientInGroups = [
    {
        id: '65587876679870098',
        name : 'medical',
        owners: ['88665','5555'],
        members: ['88665','5555'],
        patient : userId
    }];

    return resolveCallbackValues(callback,patientInGroups);
}

function handleAddUserToGroup(groupId, userId, callback) {
    log.debug('Adding user[%s] to group[%s]', userId, groupId);

    var addUserToGroups = 
    {
        id: '65587876679870098',
        name : 'medical',
        owners: ['88665','5555'],
        members: ['88665','5555',userId],
        patient : '9999999'
    };

    return resolveCallbackValues(callback,addUserToGroups);
}

function handleRemoveUserFromGroup(groupId, userId,callback){
    log.debug('Removing user[%s] from group[%s]', userId, groupId);

    var removeFromGroups = {

        id: '65587876679870098',
        name : 'medical',
        owners: ['88665','5555'],
        members: ['88665','5555'],
        patient : '9999999'
    };

    return resolveCallbackValues(callback,removeFromGroups);
}

function handleFindPatientForGroup(groupId,callback){
    log.debug('Find paitient for group[%s]', groupId);

    return resolveCallbackValues(callback,'99999999');
}

module.exports = FakeMongoHandler;
