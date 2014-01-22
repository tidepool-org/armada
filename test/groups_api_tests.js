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
    testGroup = fixture.testData.individual;

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

            mockMongoHandler = require('./helpers/mockMongoHandler')(testHandlerConfig);

            helper = fixture.testingHelper({integrationTest:false});
            helper.initArmadaService(mockMongoHandler);
        
        });

        after(function(){
            helper.stopArmadaService();
        });

        it('GET /status returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/status')
            .expect(200,done);
            
        });

        it('GET /status returns 403 when status is passed as 403', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/status?status=403')
            .expect(403,done);
            
        });

        it('GET /echo works and tells params given', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/echo?givenparam=1234')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                var params =  res.body[1].params;
                var method = res.body[1].method;

                params.should.have.property('givenparam');
                method.should.equal('GET');
                done();
            });
            
        });

        it('POST /echo works', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .post('/api/group/echo')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                var method = res.body[1].method;
                method.should.equal('POST');
                done();
            });
            
        });

        it('PUT /echo works', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .put('/api/group/echo')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                var method = res.body[1].method;
                method.should.equal('PUT');
                done();
            });
            
        });

        it('DELETE /echo works', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .del('/api/group/echo')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                var method = res.body[1].method;
                method.should.equal('DELETE');
                done();
            });
            
        });

        it('POST /api/group 201 when all good', function(done) {

            var testGroup = {
                name : 'test create for 201',
                owners: ['99999','222222'],
                members: ['99999','222222','33333212'],
                patient : '444444'
            };

            supertest(helper.armadaServiceEndpoint())
            .post('/api/group')
            .send({group:testGroup})
            .expect(201,done);

        });

        it('POST /api/group 200 when all good', function(done) {

            var testGroup = {
                name : 'test create for 201',
                owners: ['99999'],
                members: ['99999','222222','33333212'],
                patient : '444444'
            };

            supertest(helper.armadaServiceEndpoint())
            .post('/api/group')
            .send({group:testGroup})
            .expect(201,done);
            
        });

        it('GET /api/group/membership returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/member')
            .expect(200,done);
        });

        it('GET /api/group/membership/:userid/patient returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/patient')
            .expect(200,done);
        });

        it('POST /api/group/:groupid/user returns 200 when all good', function(done) {
 
            supertest(helper.armadaServiceEndpoint())
            .post('/api/group/34444444/user')
            .send({userid:'12345997'})
            .expect(200,done);
        });

        it('DELETE /api/group/:groupid/user returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .del('/api/group/34444444/user')
            .send({userid:'12345997'})
            .expect(200,done);
        });

        it('GET /api/group/:groupid/patient returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/34444444/patient')
            .expect(200,done);
        });

        it('GET /api/group/:groupid/members returns 501 as not yet implemented', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/34444444/members')
            .expect(501,done);
        });

        it('GET /api/group/:groupid/allusers returns 501 as not yet implemented', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/34444444/allusers')
            .expect(501,done);
        });
    });

    /*
    Testing the return codes are as expected there is no information to return for the
    given request.
    */
    describe('test no data returned', function() {

        var noDataHelper;

        before(function(){

            var mockMongoHandler,
                testHandlerConfig;
        
            testHandlerConfig  = {
                throwErrors : false,
                returnNone : true
            };
        
            mockMongoHandler = require('./helpers/mockMongoHandler')(testHandlerConfig);

            noDataHelper = fixture.testingHelper({integrationTest:false});
            noDataHelper.initArmadaService(mockMongoHandler);
        
        });

        after(function(){
            noDataHelper.stopArmadaService();
        });

        it('GET /api/group/membership returns 204 when no data', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/member')
            .expect(204,done);
        });

        it('GET /api/group/membership/:userid/owner returns 204 when no data', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/owner')
            .expect(204,done);
        });

        it('GET /api/group/membership/:userid/patient returns 204 when no data', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/patient')
            .expect(204,done);
        });

        it('POST /api/group/:groupid/user returns 204 when no match', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .post('/api/group/88888888/user')
            .send({userid:'12345997'})
            .expect(204,done);
        });

        it('DELETE /api/group/:groupid/user returns 204 when no match', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .del('/api/group/99999775/user')
            .send({userid:'12345997'})
            .expect(204,done);
        });

        it('GET /api/group/membership/:userid/patient returns error when one has been raised', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/patient')
            .expect(204,done);
        });
    });

    /*
    Testing the return codes are as expected when excpetions are raised when an 
    end-point is called
    */
    describe('test errors returned', function() {

        var errorsFoundHelper;

        before(function(){

            var mockMongoHandler,
                testHandlerConfig;
        
            testHandlerConfig  = {
                throwErrors : true,
                returnNone : false
            };
        
            mockMongoHandler = require('./helpers/mockMongoHandler')(testHandlerConfig);
            errorsFoundHelper = fixture.testingHelper({integrationTest:false});
            errorsFoundHelper.initArmadaService(mockMongoHandler);
        
        });

        after(function(){
            errorsFoundHelper.stopArmadaService();
        });

        it('GET /status returns 500 when there is an issue and tell me what is down', function(done) {

            supertest(errorsFoundHelper.armadaServiceEndpoint())
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


            supertest(errorsFoundHelper.armadaServiceEndpoint())
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

            supertest(errorsFoundHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/member')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });

        });

        it('GET /api/group/membership/:userid/owner returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsFoundHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/owner')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });

        });

        it('GET /api/group/membership/:userid/patient returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsFoundHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/patient')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('POST /api/group/:groupid/user returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsFoundHelper.armadaServiceEndpoint())
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

            supertest(errorsFoundHelper.armadaServiceEndpoint())
            .del('/api/group/33333/user')
            .send({userid:'12345997'})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('GET /api/group/:groupid/patient 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsFoundHelper.armadaServiceEndpoint())
            .get('/api/group/33333/patient')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });
    });

});