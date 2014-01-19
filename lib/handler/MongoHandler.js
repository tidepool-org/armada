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
