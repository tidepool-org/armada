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
    restify = require('restify'),
    testGroup = fixture.testData.individual;
/*
    ============

    Running the groups API 

    - mongo backend has been mocked

    =============
*/
describe('Groups API', function() {


    /*
        minimise the components to just groups API and mocked crud handler
    */
    var setupAPI = function(crudHandler){
    
        var server = restify.createServer({name:'Groups API Tests'});
        server.use(restify.queryParser());
        server.use(restify.bodyParser());

        var groups = require('../lib/routes/groupApi')(crudHandler);

        server.get('/api/group/status',groups.status);
        server.get('/api/group/membership/:userid/member', groups.memberOf);
        server.post('/api/group', groups.addGroup);
        server.post('/api/group/:groupid/user', groups.addToGroup);
        server.del('/api/group/:groupid/user', groups.removeFromGroup);
        server.get('/api/group/:groupid', groups.getGroup);

        return server;
    }

    /*
    Testing the return codes are as expected a requested is processed as expected.
    */
    describe('requests processed as expected', function() {

        var groupsAPI;

        before(function(){

            var mockMongoHandler = require('./mocks/mockMongoHandler')({
                throwErrors : false,
                returnNone : false
            });

            groupsAPI = setupAPI(mockMongoHandler);
        
        });

        it('GET /status returns 200 when all good', function(done) {

            supertest(groupsAPI)
            .get('/api/group/status')
            .expect(200,done);
            
        });

        it('GET /status returns 403 when status is passed as 403', function(done) {

            supertest(groupsAPI)
            .get('/api/group/status?status=403')
            .expect(403,done);
            
        });

        it('POST /api/group 201 when all good', function(done) {

            var testGroup = {
                members: ['99999','222222','33333212']
            };

            supertest(groupsAPI)
            .post('/api/group')
            .send({group:testGroup})
            .expect(201,done);

        });

        it('POST /api/group 200 when all good', function(done) {

            var testGroup = {
                members: ['99999','222222','33333212']
            };

            supertest(groupsAPI)
            .post('/api/group')
            .send({group:testGroup})
            .expect(201,done);
            
        });

        it('GET /api/group/membership returns 200 when all good', function(done) {

            supertest(groupsAPI)
            .get('/api/group/membership/33333/member')
            .expect(200,done);
        });

        it('POST /api/group/:groupid/user returns 200 when all good', function(done) {
 
            supertest(groupsAPI)
            .post('/api/group/34444444/user')
            .send({userid:'12345997'})
            .expect(200,done);
        });

        it('DELETE /api/group/:groupid/user returns 200 when all good', function(done) {

            supertest(groupsAPI)
            .del('/api/group/34444444/user')
            .send({userid:'12345997'})
            .expect(200,done);
        });

        it('GET /api/group/:groupid returns 200 when all good', function(done) {

            supertest(groupsAPI)
            .get('/api/group/34444444')
            .expect(200,done);
        });

        it('GET /api/group/:groupid returns the found group when all good', function(done) {

            supertest(groupsAPI)
            .get('/api/group/34444444')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.property('group');
                done();
            });
        });    
    });

    /*
    Testing the return codes are as expected when there is no information to return for the
    given request.
    */
    describe('requests when no match for requested resource', function() {

        var groupsAPI;

        before(function(){

            var mockMongoHandler = require('./mocks/mockMongoHandler')({
                throwErrors : false,
                returnNone : true
            });
            
            groupsAPI = setupAPI(mockMongoHandler);

        });

        it('GET /api/group/membership returns 204 when no data', function(done) {

            supertest(groupsAPI)
            .get('/api/group/membership/33333/member')
            .expect(204,done);
        });    

        it('POST /api/group/:groupid/user returns 204 when no match', function(done) {

            supertest(groupsAPI)
            .post('/api/group/88888888/user')
            .send({userid:'12345997'})
            .expect(204,done);
        });

        it('DELETE /api/group/:groupid/user returns 204 when no match', function(done) {

            supertest(groupsAPI)
            .del('/api/group/99999775/user')
            .send({userid:'12345997'})
            .expect(204,done);
        });

        it('GET /api/group/:groupid returns 204 when no match', function(done) {

            supertest(groupsAPI)
            .get('/api/group/88888888888888')
            .expect(204,done);
        });

    });

    /*
    Testing the return codes are as expected when excpetions are raised as 
    part of processing the request
    */
    describe('requests when an exception is raised as part of processing', function() {

        var groupsAPI;

        before(function(){

            var mockHandler = require('./mocks/mockMongoHandler')({
                throwErrors : true,
                returnNone : false
            });
            
            groupsAPI = setupAPI(mockHandler);
            
        });

        it('GET /status returns 500 when there is an issue and tell me what is down', function(done) {

            supertest(groupsAPI)
            .get('/api/group/status')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                res.body.should.have.property('down').with.length.greaterThan(0);
                done();
            });
            
        });

        it('POST /api/group returns 500 and does not return error so we do not leak implemention details', function(done) {

            var groupToAdd = testGroup;


            supertest(groupsAPI)
            .post('/api/group')
            .send({group:groupToAdd})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('GET /api/group/membership returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(groupsAPI)
            .get('/api/group/membership/33333/member')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });

        });

        it('POST /api/group/:groupid/user returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(groupsAPI)
            .post('/api/group/33333/user')
            .send({userid:'12345997'})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('DELETE /api/group/:groupid/user returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(groupsAPI)
            .del('/api/group/33333/user')
            .send({userid:'12345997'})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('GET /api/group/:groupid returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(groupsAPI)
            .get('/api/group/88888888888888')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });


    });

});