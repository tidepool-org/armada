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

var fixture = require('./helpers/fixtures.js'),
/*jshint unused:false */
    should = fixture.should,
    helper = fixture.testingHelper(true),
    testGroups = fixture.testData.relatedSet,
    testDbInstance,
    testGroups,
    mongoHandler;

describe('handleMongo', function() {

    before(function(){

        /*
        Setup
        */
        var config;

        config = require('../env');
        
        if(config.mongoDbConnectionString == null){
            config.mongoDbConnectionString = 'mongodb://localhost/tidepool-platform';
        }

        console.log('testing connection ',config.mongoDbConnectionString);

        mongoHandler = require('../lib/handler/mongoHandler')(config.mongoDbConnectionString);
        
        testDbInstance = helper.mongoTestInstance();
        
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
            name : 'createGroup test',
            owners: ['XX888S22'],
            members: ['XX888S22','DD55550'],
            patient : '1234XD5'
        };

        mongoHandler.createGroup(dummyGroup,function(error,id){
            if(error){
                return done(error);
            }
            id.should.not.equal('');
            helper.validateId(id).should.be.true;
            done();
        });

    });

    it('findGroupsPatientIn find one group valid for patient 99', function(done) {

        var patientId ='99';

        mongoHandler.findGroupsPatientIn(patientId,function(error,groups){
            if(error){
                return done(error);
            }
            groups.length.should.equal(1);
            var theGroup = groups[0];
            helper.validateGroup(theGroup).should.be.true;
            done();
        });

    });

    it('findGroupsMemberOf for user 3343 should return two valid groups', function(done) {

        var userId ='3343';

        mongoHandler.findGroupsMemberOf(userId,function(error,groups){
            if(error){
                return done(error);
            }
            groups.length.should.equal(2);
            groups.forEach(function(theGroup){
                helper.validateGroup(theGroup).should.be.true;
            });
            
            done();
        });

    });

    it('findGroupsOwnerOf for user 99999 should return one valid group', function(done) {

        var userId ='99999';

        mongoHandler.findGroupsOwnerOf(userId,function(error,groups){
            if(error){
                return done(error);
            }
            groups.length.should.equal(1);
            groups.forEach(function(theGroup){
                helper.validateGroup(theGroup).should.be.true;
            });
            
            done();
        });

    });

    it('addUserToGroup for user 002JHB77 should return one valid group that has included that user', function(done) {

        var userId ='002JHB77';

        var dummyGroup = {
            name : 'addUserToGroup test',
            owners: ['XX888S22'],
            members: ['XX888S22'],
            patient : '1234XD5'
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
                helper.validateGroup(group).should.be.true;
                group.members.should.contain(userId);
            
                done();
            });
        });

    });

    it('removeUserFromGroup for user 007722B77DF should return one valid group that no longer contains that user', function(done) {

        var userId ='002JHB77';

        var dummyGroup = {
            name : 'removeUserFromGroup test',
            owners: ['XX888S22','007722B77DF'],
            members: ['XX888S22','007722B77DF'],
            patient : '1234XD5'
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
                helper.validateGroup(group).should.be.true;
                group.members.should.not.contain(userId);
                group.owners.should.not.contain(userId);
            
                done();
            });
        });

    });

    it('findPatientForGroup for group will return the patientId 002JHB77', function(done) {

        var patientId ='002JHB77';

        var dummyGroup = {
            name : 'findPatientForGroup test',
            owners: ['XX888S22','007722B77DF'],
            members: ['XX888S22','007722B77DF'],
            patient : patientId
        };

        mongoHandler.createGroup(dummyGroup,function(error,id){
            if(error){
                return done(error);
            }
            
            var groupId = String(id);

            mongoHandler.findPatientForGroup(groupId,function(error,patientId){
                if(error){
                    return done(error);
                }

                patientId.should.equal(patientId);
        
                done();
            });
        });

    });
        
});