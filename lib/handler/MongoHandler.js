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

var mongojs = require('mongojs'),
    groupsCollection,
    dependencyStatus = { running: false, deps: { up: [], down: [] } },
    groupsCollectionName = 'groups',
    log = require('../log.js')('mongoHandler.js')

/*
    Handler CRUD opertaions via Mongo instance
*/
var mongoHandler = function(connectionString) {

    var dbInstance = mongojs(connectionString, [groupsCollectionName]);
    groupsCollection = dbInstance.collection(groupsCollectionName);

    return {
        status : status,
        createGroup : handleCreateGroup,
        findGroupsMemberOf : handleFindGroupsMemberOf,
        addUserToGroup : handleAddUserToGroup,
        removeUserFromGroup : handleRemoveUserFromGroup
    };
};

/*
    With mongo we change to use the id field
*/
function setGroup(doc){
    var group = {};
    group.id = doc._id;
    group.members = doc.members;
    return group;
}

function status(callback){
    log.debug('checking status');
    dependencyStatus.running = (dependencyStatus.deps.down.length === 0);
    dependencyStatus.statuscode = dependencyStatus.running ? 200 : 500;
    return callback(null,dependencyStatus)
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
        { members : userId }
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
        update: { $pull : { members : userId } }, //remove user from these
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

module.exports = mongoHandler;
