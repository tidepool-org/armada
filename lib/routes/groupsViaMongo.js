'use strict';
/*
    Mongo instance of group-api CRUD operations
*/
module.exports = function(config,type) {

    var mongojs,
        dbInstance,
        groupsCollectionName,
        groupsCollection,
        log;  

    mongojs = require('mongojs');

    log = require('../log.js')('groupsViaMongo.js');

    groupsCollectionName = 'groups';
    dbInstance = mongojs(config.mongodb_connection_string, [groupsCollectionName]);
    groupsCollection = dbInstance.collection(groupsCollectionName);

    /*
        How we want to represent a group
    */
    var returnGroup = function(doc){

        var group = {
            id : doc._id,
            name : doc.name,
            patientid : doc.patientid,
            owners : doc.owners
        };

        return group;
    };

    /*
        Id the given Id valid for Mongo
    */
    var objectIdIsValid = function(idString){
        try{
            mongojs.ObjectId(idString);
        }catch(error){
            log.warn('given[%j] is an invalid mongojs.ObjectId.',idString);
            return false;
        }
        return true;
    };


    var createGroupInMongo = function(group,callback) {
        log.debug('Create in mongo group[%j]', group);

        groupsCollection.save(group, function(error, doc) {
            if (error) {
                log.error(error);
                return callback(error,null);
            } else {
                return callback(null, doc._id);
            }
        });
    };

    return {
        createGroupInMongo: createGroupInMongo
    };
};

