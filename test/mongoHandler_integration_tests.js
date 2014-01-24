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

var fixture = require('./helpers/fixtures'),
/*jshint unused:false */
    should = fixture.should,
    helper = fixture.armadaTestHelper,
    testGroups = fixture.testData.relatedSet,
    testDbInstance,
    testGroups,
    mongoHandler;

describe('handleMongo', function() {

    before(function(){

        var testConfig = helper.testConfig;
        mongoHandler = require('../lib/handler/mongoHandler')(testConfig.mongoDbConnectionString);
        testDbInstance = helper.createMongoInstance();
        
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
            id.should.not.equal('');
            helper.isValidId(id).should.be.true;
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

    it('addUserToGroup for user 002JHB77 should return one valid group that has included that user', function(done) {

        var userId ='002JHB77';

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
                helper.validateGroup(group).should.be.true;
                group.members.should.contain(userId);
            
                done();
            });
        });

    });

    it('removeUserFromGroup for user 007722B77DF should return one valid group that no longer contains that user', function(done) {

        var userId ='002JHB77';

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
                helper.validateGroup(group).should.be.true;
                group.members.should.not.contain(userId);
            
                done();
            });
        });

    });
        
});