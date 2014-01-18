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

var log,
settings;

/*
    Handler CRUD opertaions via Mongo instance, 
    takes testing config that allows the hadler to follow
    different paths.

    1) settings.throwErrors will throw errors so we can test that path
    2) settings.returnNone will return nothing so we can test nothing found
    3) other wise we just return dummy data

*/
var fakeMongoHandler = function(testingConfig) {

    log = require('../../lib/log.js')('FakeMongoHandler.js');
    settings = testingConfig;

    return {
        createGroup : handleCreateGroup,
        findGroupsPatientIn : handleFindGroupsPatientIn,
        findGroupsMemberOf : handleFindGroupsMemberOf,
        findGroupsOwnerOf : handleFindGroupsOwnerOf,
        addUserToGroup : handleAddUserToGroup,
        removeUserFromGroup : handleRemoveUserFromGroup,
        findPatientForGroup : handleFindPatientForGroup
    };

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

    var memberGroups = [{
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

    var ownerGroups = [{
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

    var patientInGroups = [{
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

module.exports = fakeMongoHandler;
