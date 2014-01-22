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
    supertest = fixture.supertest,
    helper = fixture.testingHelper({integrationTest:true}),
    testGroups = fixture.testData.relatedSet,
    testGroup = fixture.testData.individual,
    apiEndPoint,
    testDbInstance;

describe('Groups API', function() {

    before(function(){

        /*
        Setup
        */
        var config,
            mongoHandler;

        config = helper.testConfig();    
    
        mongoHandler = require('../lib/handler/MongoHandler')(config.mongoDbConnectionString);
        
        helper.initArmadaService(mongoHandler);
        testDbInstance = helper.mongoTestInstance();
        apiEndPoint = helper.armadaServiceEndpoint();

        /*
        Clean and then load our test data
        */
        testDbInstance.groups.remove();

        testGroups.forEach(function(group) {
            testDbInstance.groups.save(group);
        });
    });

    describe('POST /api/group', function() {

        it('returns 400 when given an invalid group to create', function(done) {

            var badGroup = {
                nothing : ''
            };

            supertest(apiEndPoint)
            .post('/api/group')
            .send({group:badGroup})
            .expect(400)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
        });

        it('returns 400 when no data is sent', function(done) {

            supertest(apiEndPoint)
            .post('/api/group')
            .expect(400)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
        });

        it('returns id with 201 response', function(done) {

            var testGroupFor201 = testGroup;

            supertest(apiEndPoint)
            .post('/api/group')
            .send({group:testGroupFor201})
            .expect(201)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.have.property('id');
                res.body.id.should.not.equal('');
                done();
            });
        });

        it('id is valid', function(done) {

            var groupToAdd = testGroup;

            supertest(apiEndPoint)
            .post('/api/group')
            .send({group:groupToAdd})
            .expect(201)
            .end(function(err, res) {
                if (err) return done(err);
                helper.validateId(res.body.id).should.equal(true);
                done();
            });
        });
        
    });

    describe('GET /api/group/membership/:userid/member', function() {

        it('returns 200 and two groups when I ask for 12345', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/membership/12345/member')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.groups.length.should.equal(2);

                done();
            });
        });

        it('the groups should be valid', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/membership/12345/member')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                var foundGroups = res.body.groups;

                foundGroups.forEach(function(group){
                    helper.validateGroup(group).should.equal(true);
                });

                done();
            });
        });
    });

    describe('GET /api/group/membership/:userid/owner', function() {

        it('returns 200 and two groups', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/membership/3343/owner')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.groups.length.should.equal(2);
                done();
            });
        });

        it('the two groups should be valid', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/membership/3343/owner')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                var foundGroups = res.body.groups;

                foundGroups.forEach(function(group){
                    helper.validateGroup(group).should.equal(true);
                });

                done();
            });
        });
    });

    describe('GET /api/group/:groupid/patient', function() {

        it('returns 200 and one groups when I ask for patient 8876', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/membership/8876/patient')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.groups.length.should.equal(1);

                done();
            });
        });

        it('the one group for patient is valid', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/membership/8876/patient')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                var foundGroups = res.body.groups;

                foundGroups.forEach(function(group){
                    helper.validateGroup(group).should.equal(true);
                });

                done();
            });
        });
    });

    describe('POST /api/group/:groupid/user', function() {

        var testGroupContent;

        before(function(done){
            //Get existing group to use in tests 
            testDbInstance.groups.findOne({},function(err, doc) {
                testGroupContent = doc;
                done();
            });
        });

        it('returns 200 when user is added to the group', function(done) {

            var groupId = testGroupContent._id;
            var userToAdd = '12345997';

            supertest(apiEndPoint)
            .post('/api/group/'+groupId+'/user')
            .send({userid : userToAdd})
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
            
                res.body.should.have.property('group');

                done();
            });
        });

        it('the updated group is returned with the new user and is valid', function(done) {

            var groupId = testGroupContent._id;
            var userToAdd = '12345997';

            supertest(apiEndPoint)
            .post('/api/group/'+groupId+'/user')
            .send({userid : userToAdd})
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                //get the group and check
                var updatedGroup = res.body.group;
                updatedGroup.members.should.contain(userToAdd);
                helper.validateGroup(updatedGroup).should.equal(true);

                done();
            });
        });

    });

    describe('DELETE /api/group/:groupid/user', function() {

        var testdelUserGroup;

        before(function(done){
            //Get existing group to use in tests 
            testDbInstance.groups.findOne({name:'test_deluser'},function(err, doc) {
                testdelUserGroup = doc;
                done();
            });
        });

        it('returns 200 and the updated group when user is removed from the group', function(done) {

            var groupId = testdelUserGroup._id;
            var userToRemove = testdelUserGroup.members[1];

            supertest(apiEndPoint)
            .del('/api/group/'+groupId+'/user')
            .send({userid : userToRemove})
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.have.property('group');
                done();
            });
        });

        it('the updated group does not contain the user and is valid', function(done) {

            var groupId = testdelUserGroup._id;
            var userToRemove = testdelUserGroup.members[1];

            supertest(apiEndPoint)
            .del('/api/group/'+groupId+'/user')
            .send({userid : userToRemove})
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                //get the group and check
                var updatedGroup = res.body.group;
                updatedGroup.members.should.not.contain(userToRemove);

                helper.validateGroup(updatedGroup).should.equal(true);

                done();
            });
        });

        it('returns 200 when try to remove a user that is not in the group anyway', function(done) {

            //i am just guessing????
            var groupId = testdelUserGroup._id;
            var userToRemove = '123xx45997';

            supertest(apiEndPoint)
            .del('/api/group/deluser/'+groupId)
            .send({userid : userToRemove})
            .expect(200,done());
        });

    });

    describe('GET /api/group/:groupid/patient', function() {

        var testGroup;

        before(function(done){
            //Get existing group to use in tests 
            testDbInstance.groups.findOne({},function(err, doc) {
                testGroup = doc;
                done();
            });
        });

        it('returns 200 and the patient id when found', function(done) {

            var groupId = testGroup._id;
            var patientId = testGroup.patient;

            supertest(apiEndPoint)
            .get('/api/group/'+groupId+'/patient')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                //get the group and check
                res.body.patient.should.equal(patientId);
                done();
            });
        });

    });

});