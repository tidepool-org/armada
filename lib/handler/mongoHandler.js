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

var mongojs = require('mongojs');
var _ = require('lodash');

var log = require('../log.js')('mongoHandler.js');

var groupsCollectionName = 'groups';

/*
 Handler CRUD opertaions via Mongo instance
 */
module.exports = function mongoHandler(connectionString) {

  var dependencyStatus = { running: false, deps: { up: [], down: [] } };

  var dbInstance = mongojs(connectionString, [groupsCollectionName],function(err){
    log.error('error opening mongo');
    dependencyStatus.deps.up = _.without(dependencyStatus.deps.up, 'mongo');
    dependencyStatus.deps.down = _.union(dependencyStatus.deps.down, ['mongo']);
  });

  dependencyStatus.deps.down = _.without(dependencyStatus.deps.down, 'mongo');
  dependencyStatus.deps.up = _.union(dependencyStatus.deps.up, ['mongo']);

  var groupsCollection = dbInstance.collection(groupsCollectionName);

  /*
   With mongo we change to use the id field
   */
  function setGroup(doc) {
    var group = {};
    group.id = doc._id;
    group.members = doc.members;
    return group;
  }

  return {
    status: function status(callback) {
      log.debug('checking status');
      return callback(null, dependencyStatus);
    },

    createGroup: function (group, callback) {
      log.debug('Create in mongo group[%j]', group);

      groupsCollection.save(group, function (error, doc) {
        if (error) {
          return callback(error, null);
        }
        else {
          return callback(null, doc._id);
        }
      });
    },

    findGroupsMemberOf: function (userId, callback) {
      log.debug('Finding groups member of userid[%s]', userId);

      groupsCollection.find(
        { $or: [
          { members: userId }
        ]},
        function (error, doc) {
          if (error) {
            return callback(error, null);
          }
          else {
            var groups = [];
            doc.forEach(function (item) {
              groups.push(setGroup(item));
            });
            return callback(null, groups);
          }
        });
    },

    addUserToGroup: function (groupId, userId, callback) {
      log.debug('Adding user[%s] to group[%s]', userId, groupId);

      groupsCollection.findAndModify(
        {
          query: { _id: mongojs.ObjectId(groupId) },
          update: { $push: { members: userId } }, //add the user to the members array
          new: true //we are using new : true to return the updated group
        },
        function (error, doc) {
          if (error) {
            return callback(error, null);
          }

          log.debug('Update [%j] groups by adding user[%s]', doc, userId);
          return callback(null, setGroup(doc));
        });
    },

    removeUserFromGroup: function (groupId, userId, callback) {
      log.debug('Removing user[%s] from group[%s]', userId, groupId);

      groupsCollection.findAndModify(
        {
          query: { _id: mongojs.ObjectId(groupId) },
          update: { $pull: { members: userId } }, //remove user from these
          new: true //using new : true to return the updated group
        },
        function (error, doc) {
          if (error) {
            return callback(error, null);
          }

          log.debug('Update [%j] groups by removing user[%s]', doc, userId);

          return callback(null, setGroup(doc));
        });
    },

    findGroup: function (groupId, callback) {
      log.debug('Finding group[%s]', groupId);

      groupsCollection.findOne(
        {
          query: { _id: mongojs.ObjectId(groupId) }
        },
        function (error, doc) {
          if (error) {
            return callback(error, null);
          }

          log.debug('Found [%j] group', doc);
          return callback(null, setGroup(doc));
        });
    }
  };
};