'use strict';

var mongojs,
    groupsCollection,
    log;

/*
    Handler CRUD opertaions via Mongo instance
*/
var MongoHandler = function(config) {

    var groupsCollectionName, dbInstance;

    mongojs = require('mongojs');

    log = require('../log.js')('MongoHandler.js');

    groupsCollectionName = 'groups';
    dbInstance = mongojs(config.mongodb_connection_string, [groupsCollectionName]);
    groupsCollection = dbInstance.collection(groupsCollectionName);

    this.createGroup = handleCreateGroup;
    this.findGroupsPatientIn = handleFindGroupsPatientIn;
    this.findGroupsMemberOf = handleFindGroupsMemberOf;
    this.findGroupsOwnerOf = handleFindGroupsOwnerOf;
    this.addUserToGroup = handleAddUserToGroup;
    this.removeUserFromGroup = handleRemoveUserFromGroup;
};

function handleCreateGroup (group,callback) {
    log.debug('Create in mongo group[%j]', group);

    groupsCollection.save(group, function(error, doc) {
        if (error) {
            log.error(error);
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
            log.error(error);
            return callback(error,null);
        } else {
            return callback(null,doc);
        }
    });
}

function handleFindGroupsOwnerOf(userId,callback) {
    log.debug('Finding groups owned by userid[%s]', userId);
    groupsCollection.find(
        { owners : userId }
    , function(error,doc){
        if (error) {
            log.error(error);
            return callback(error,null);
        } else {
            return callback(null,doc);
        }
    });
}

function handleFindGroupsPatientIn(userId,callback) {
    log.debug('Finding groups patient[%s] is in', userId);
    groupsCollection.find(
        { patient :userId },
        function(error,doc){
            if (error) {
                log.error(error);
                return callback(error,null);
            } else {
                return callback(null,doc);
            }
        }
    );
}

function handleAddUserToGroup(groupId, userId, callback) {
    log.debug('Adding user[%s] to group[%s]', userId, groupId);

    //we are using new : true to return the updated group
    groupsCollection.findAndModify({
        query: { _id : mongojs.ObjectId(groupId) },
        update: { $push : { members : userId } },
        new : true
        }, function(error, doc) {
             if (error) {
                log.error(error);
                return callback(error,null);
            }
               
            log.debug('Update [%j] groups by adding user[%s]', doc, userId);
            
            return callback(null,doc);
        }
    );
}

function handleRemoveUserFromGroup(groupId, userId, callback) {
    log.debug('Removing user[%s] from group[%s]', userId, groupId);

    //we are using new : true to return the updated group
    groupsCollection.findAndModify({
        query: { _id : mongojs.ObjectId(groupId) },
        update: { $pull : { members : userId , owners : userId } },
        new : true
        }, function(error, doc) {
             if (error) {
                log.error(error);
                return callback(error,null);
            }
             
            log.debug('Update [%j] groups by removing user[%s]', doc, userId);
            
            return callback(null,doc);
        }
    );
}

module.exports = MongoHandler;
