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
    testGroup = fixture.testData.individual, 
    sessionToken = fixture.armadaTestHelper.sessiontoken;

describe('Groups API', function() {

    /*
    Testing the return codes are as expected when things go as expected when calling an endpoint 
    for the groups API. 
    */
    describe('test normal route ', function() {

        var helper;

        before(function(){

            var mockMongoHandler,
                testHandlerConfig;
            
            // just a  way of seeting the path that the fake 
            testHandlerConfig  = {
                throwErrors : false,
                returnNone : false
            };

            mockMongoHandler = require('./mocks/mockMongoHandler')(testHandlerConfig);

            helper = fixture.armadaTestHelper;
            helper.initArmadaService(mockMongoHandler);
        
        });

        after(function(){
            helper.stopTestService();
        });

        it('GET /status returns 401 when no token given', function(done) {

            supertest(helper.testServiceEndpoint())
            .get('/api/group/status?status=403')
            .expect(401,done);
            
        });

        it('GET /status returns 200 when all good', function(done) {

            supertest(helper.testServiceEndpoint())
            .get('/api/group/status')
            .set('X-Tidepool-Session-Token', sessionToken)
            .expect(200,done);
            
        });

        it('GET /status returns 403 when status is passed as 403', function(done) {

            supertest(helper.testServiceEndpoint())
            .get('/api/group/status?status=403')
            .set('X-Tidepool-Session-Token', sessionToken)
            .expect(403,done);
            
        });

        it('POST /api/group 401 no token given', function(done) {

            var testGroup = {
                members: ['99999','222222','33333212']
            };

            supertest(helper.testServiceEndpoint())
            .post('/api/group')
            .send({group:testGroup})
            .expect(401,done);

        });

        it('POST /api/group 201 when all good', function(done) {

            var testGroup = {
                members: ['99999','222222','33333212']
            };

            supertest(helper.testServiceEndpoint())
            .post('/api/group')
            .set('X-Tidepool-Session-Token', sessionToken)
            .send({group:testGroup})
            .expect(201,done);

        });

        it('POST /api/group 200 when all good', function(done) {

            var testGroup = {
                members: ['99999','222222','33333212']
            };

            supertest(helper.testServiceEndpoint())
            .post('/api/group')
            .set('X-Tidepool-Session-Token', sessionToken)
            .send({group:testGroup})
            .expect(201,done);
            
        });

        it('GET /api/group/membership returns 401 when no token', function(done) {

            supertest(helper.testServiceEndpoint())
            .get('/api/group/membership/33333/member')
            .expect(401,done);
        });

        it('GET /api/group/membership returns 200 when all good', function(done) {

            supertest(helper.testServiceEndpoint())
            .get('/api/group/membership/33333/member')
            .set('X-Tidepool-Session-Token', sessionToken)
            .expect(200,done);
        });

        it('POST /api/group/:groupid/user returns 401 when no token', function(done) {
 
            supertest(helper.testServiceEndpoint())
            .post('/api/group/34444444/user')
            .send({userid:'12345997'})
            .expect(401,done);
        });

        it('POST /api/group/:groupid/user returns 200 when all good', function(done) {
 
            supertest(helper.testServiceEndpoint())
            .post('/api/group/34444444/user')
            .set('X-Tidepool-Session-Token', sessionToken)
            .send({userid:'12345997'})
            .expect(200,done);
        });

        it('DELETE /api/group/:groupid/user returns 401 when no token', function(done) {

            supertest(helper.testServiceEndpoint())
            .del('/api/group/34444444/user')
            .send({userid:'12345997'})
            .expect(401,done);
        });

        it('DELETE /api/group/:groupid/user returns 200 when all good', function(done) {

            supertest(helper.testServiceEndpoint())
            .del('/api/group/34444444/user')
            .set('X-Tidepool-Session-Token', sessionToken)
            .send({userid:'12345997'})
            .expect(200,done);
        });

        it('GET /api/group/:groupid/members returns 401 when no token', function(done) {

            supertest(helper.testServiceEndpoint())
            .get('/api/group/34444444/members')
            .expect(401,done);
        });

        it('GET /api/group/:groupid/members returns 501 as not yet implemented', function(done) {

            supertest(helper.testServiceEndpoint())
            .get('/api/group/34444444/members')
            .set('X-Tidepool-Session-Token', sessionToken)
            .expect(501,done);
        });

    });

    /*
    Testing the return codes are as expected there is no information to return for the
    given request.
    */
    describe('test no data returned', function() {

        var helper;

        before(function(done){

            var mockMongoHandler,
                testHandlerConfig;
        
            testHandlerConfig  = {
                throwErrors : false,
                returnNone : true
            };
        
            mockMongoHandler = require('./mocks/mockMongoHandler')(testHandlerConfig);

            helper = fixture.armadaTestHelper;
            helper.initArmadaService(mockMongoHandler);
            done();
        });

        after(function(done){
            helper.stopTestService();
            done();
        });

        it('GET /api/group/membership returns 204 when no data', function(done) {

            supertest(helper.testServiceEndpoint())
            .get('/api/group/membership/33333/member')
            .set('X-Tidepool-Session-Token', sessionToken)
            .expect(204,done);
        });    

        it('POST /api/group/:groupid/user returns 204 when no match', function(done) {

            supertest(helper.testServiceEndpoint())
            .post('/api/group/88888888/user')
            .set('X-Tidepool-Session-Token', sessionToken)
            .send({userid:'12345997'})
            .expect(204,done);
        });

        it('DELETE /api/group/:groupid/user returns 204 when no match', function(done) {

            supertest(helper.testServiceEndpoint())
            .del('/api/group/99999775/user')
            .set('X-Tidepool-Session-Token', sessionToken)
            .send({userid:'12345997'})
            .expect(204,done);
        });

    });

    /*
    Testing the return codes are as expected when excpetions are raised when an 
    end-point is called
    */
    describe('test errors returned', function() {

        var helper;

        before(function(){

            var mockMongoHandler,
                testHandlerConfig;
        
            testHandlerConfig  = {
                throwErrors : true,
                returnNone : false
            };
        
            mockMongoHandler = require('./mocks/mockMongoHandler')(testHandlerConfig);
            helper = fixture.armadaTestHelper;
            helper.initArmadaService(mockMongoHandler);
        
        });

        after(function(){
            helper.stopTestService();
        });

        it('GET /status returns 500 when there is an issue and tell me what is down', function(done) {

            supertest(helper.testServiceEndpoint())
            .get('/api/group/status')
            .set('X-Tidepool-Session-Token', sessionToken)
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


            supertest(helper.testServiceEndpoint())
            .post('/api/group')
            .set('X-Tidepool-Session-Token', sessionToken)
            .send({group:groupToAdd})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('GET /api/group/membership returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(helper.testServiceEndpoint())
            .get('/api/group/membership/33333/member')
            .set('X-Tidepool-Session-Token', sessionToken)
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });

        });

        it('POST /api/group/:groupid/user returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(helper.testServiceEndpoint())
            .post('/api/group/33333/user')
            .set('X-Tidepool-Session-Token', sessionToken)
            .send({userid:'12345997'})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('DELETE /api/group/:groupid/user returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(helper.testServiceEndpoint())
            .del('/api/group/33333/user')
            .set('X-Tidepool-Session-Token', sessionToken)
            .send({userid:'12345997'})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });
    });

});