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

var expect = require('salinity').expect;

var mongoHandler;
var testDbInstance;

var env = {
  mongoConnectionString: 'mongodb://localhost/test_armada'
};

var testGroups = require('../data/testGroupsData').relatedSet;

var createMongoInstance = function(connectionString){
  var mongojs = require('mongojs');
  return mongojs(connectionString, ['groups']);
};

describe('handleMongo', function() {

  function validateGroup(group){
    if (('id' in group) &&
        ('members' in group && group.members.length > 0))
    {
      return true;
    } else {
      return false;
    }
  }

  before(function(){
    //basic setup
    mongoHandler = require('../../lib/handler/mongoHandler')(env.mongoConnectionString);
    testDbInstance = createMongoInstance(env.mongoConnectionString);
  });

  beforeEach(function(done){
    // keep mongo clean between runs
    testDbInstance.groups.remove();

    testGroups.forEach(function(group) {
      testDbInstance.groups.save(group);
    });

    done();
  });

  it('createGroup ', function(done) {

    var dummyGroup = {
      members: ['XX888S22','DD55550']
    };

    mongoHandler.createGroup(dummyGroup,function(error,id){
      if(error){
        return done(error);
      }
      expect(id).to.exist;

      done();
    });

  });

  it('findGroupsMemberOf for user 3343 should return two valid groups', function(done) {

    var userId ='3343';

    mongoHandler.findGroupsMemberOf(userId,function(error,groups){
      if(error){
        return done(error);
      }
      expect(groups.length).to.equal(2);
      groups.forEach(function(theGroup){
        expect(validateGroup(theGroup)).to.be.true;
      });
      done();
    });

  });

  it('addUserToGroup for user 002JHB77 should return one valid group that has included that user', function(done) {

    var dummyGroup = {
      members: ['XX888S22']
    };

    mongoHandler.createGroup(dummyGroup,function(error,id){
      if(error){
        return done(error);
      }
      var userId ='002JHB77';
      var groupId = String(id);

      mongoHandler.addUserToGroup(groupId,userId,function(error,group){
        if(error){
          return done(error);
        }
        expect(validateGroup(group)).be.true;
        expect(group.members).contain(userId);

        done();
      });
    });

  });

  it('removeUserFromGroup for user 007722B77DF should return one valid group that no longer contains that user', function(done) {

    var dummyGroup = {
      members: ['XX888S22','007722B77DF']
    };

    mongoHandler.createGroup(dummyGroup,function(error,id){
      if(error){
        return done(error);
      }
      var userId ='007722B77DF';
      var groupId = String(id);

      mongoHandler.removeUserFromGroup(groupId,userId,function(error,group){
        if(error){
          return done(error);
        }
        expect(validateGroup(group)).be.true;
        expect(group.members).to.not.contain(userId);

        done();
      });
    });

  });

});