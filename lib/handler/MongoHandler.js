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

var mongojs = require('mongojs'),
    groupsCollection,
    groupsCollectionName = 'groups',
    log = require('../log.js')('MongoHandler.js');

/*
    Handler CRUD opertaions via Mongo instance
*/
var mongoHandler = function(connectionString) {

    var dbInstance = mongojs(connectionString, [groupsCollectionName]);
    groupsCollection = dbInstance.collection(groupsCollectionName);

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

/*
    With mongo we change to use the if field
*/
function setGroup(doc){
    var group = {};
    group.id = doc._id;
    group.owners = doc.owners;
    group.members = doc.members;
    group.patient = doc.patient;
    group.name = doc.name;
    return group;
}

function handleCreateGroup (group,callback) {
    log.debug('Create in mongo group[%j]', group);

    groupsCollection.save(group, function(error, doc) {
        if (error) {
            return callback(error,null);
        } else {
            return callback(null, doc._id);
        }
    });
}

function handleFindGroupsMemberOf(userId,callback) {
    
    log.debug('Finding groups member of userid[%s]', userId);
    groupsCollection.find({ $or: [
        { owners : userId },
        { members : userId },
        { patient : userId }
    ]},
    function(error,doc){
        if (error) {
            return callback(error,null);
        } else {
            var groups = [];
            doc.forEach(function(item){
                groups.push(setGroup(item));
            });
            return callback(null,groups);
        }
    });
}

function handleFindGroupsOwnerOf(userId,callback) {
    log.debug('Finding groups owned by userid[%s]', userId);
    groupsCollection.find(
        { owners : userId }
    , function(error,doc){
        if (error) {
            return callback(error,null);
        } else {
            var groups = [];
            doc.forEach(function(item){
                groups.push(setGroup(item));
            });
            return callback(null,groups);
        }
    });
}

function handleFindGroupsPatientIn(userId,callback) {
    log.debug('Finding groups patient[%s] is in', userId);
    groupsCollection.find(
        { patient :userId },
        function(error,doc){
            if (error) {
                return callback(error,null);
            }

            var groups = [];
            doc.forEach(function(item){
                groups.push(setGroup(item));
            });
            return callback(null,groups);
        }
    );
}

function handleAddUserToGroup(groupId, userId, callback) {
    log.debug('Adding user[%s] to group[%s]', userId, groupId);

    groupsCollection.findAndModify({
        query: { _id : mongojs.ObjectId(groupId) },
        update: { $push : { members : userId } }, //add the user to the members array 
        new : true //we are using new : true to return the updated group
    },
    function(error, doc) {
        if (error) {
            return callback(error,null);
        }

        log.debug('Update [%j] groups by adding user[%s]', doc, userId);
        return callback(null,setGroup(doc));
    });
}

function handleRemoveUserFromGroup(groupId, userId, callback) {
    log.debug('Removing user[%s] from group[%s]', userId, groupId);

    groupsCollection.findAndModify({
        query: { _id : mongojs.ObjectId(groupId) },
        update: { $pull : { members : userId , owners : userId } }, //remove user from these
        new : true //using new : true to return the updated group
    },
    function(error, doc) {
        if (error) {
            return callback(error,null);
        }
             
        log.debug('Update [%j] groups by removing user[%s]', doc, userId);
            
        return callback(null,setGroup(doc));
    });
}

function handleFindPatientForGroup(groupId, callback) {
    log.debug('Finding patient for group[%s]', groupId);

    groupsCollection.findOne(
        { _id : mongojs.ObjectId(groupId) },
        function(error, doc) {
            if (error) {
                return callback(error,null);
            }
            return callback(null,doc.patient);
        }
    );
}

module.exports = mongoHandler;
