/*
 * Copyright (c) 2014, Tidepool Project
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';
var fixture = require('./fixtures.js'),
/*jshint unused:false */
    should = fixture.should,
    supertest = fixture.supertest;

describe('message API', function() {

    describe('test normal route ', function() {

        var helper;

        before(function(){

            var fakeMongoHandler,
                port,
                testConfig;

            // for testing     
            port = 3400;
            
            // just a  way of seeting the path that the fake 
            testConfig  = {
                throwErrors : false,
                returnNone : false
            };

            fakeMongoHandler = require('./handler/FakeMongoHandler')(testConfig);

            helper = fixture.testingHelper(false);
            helper.initArmadaService(fakeMongoHandler,port);
        
        });

        after(function(){
            helper.stopArmadaService();
        });

        it('post /api/group 201 when all good', function(done) {

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

        it('post /api/group 200 when all good', function(done) {

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

        it('/api/group/membership returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/member')
            .expect(200,done);
        });

        it('/api/group/membership/:userid/patient returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/patient')
            .expect(200,done);
        });

        it('/api/group/:groupid/user returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .post('/api/group/34444444/user')
            .send({userid:'12345997'})
            .expect(200,done);
        });

        it('delete /api/group/:groupid/user returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .del('/api/group/34444444/user')
            .send({userid:'12345997'})
            .expect(200,done);
        });

        it('/api/group/:groupid/patient returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/34444444/patient')
            .expect(200,done);
        });

        it('get /api/group/:groupid/members returns 501 as not yet implemented', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/34444444/members')
            .expect(501,done);
        });

        it('/api/group/:groupid/allusers returns 501 as not yet implemented', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/34444444/allusers')
            .expect(501,done);
        });
    });

    describe('test no data returned', function() {

        var noDataHelper;

        before(function(){

            var fakeMongoHandler,
                port,
                testConfig;

            port = 3400;
        
            testConfig  = {
                throwErrors : false,
                returnNone : true
            };
        
            fakeMongoHandler = require('./handler/FakeMongoHandler')(testConfig);

            noDataHelper = fixture.testingHelper(false);
            noDataHelper.initArmadaService(fakeMongoHandler,port);
        
        });

        after(function(){
            noDataHelper.stopArmadaService();
        });

        it('/api/group/membership returns 204 when no data', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/member')
            .expect(204,done);
        });

        it('/api/group/membership/:userid/owner returns 204 when no data', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/owner')
            .expect(204,done);
        });

        it('/api/group/membership/:userid/patient returns 204 when no data', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/patient')
            .expect(204,done);
        });

        it('/api/group/:groupid/user returns 204 when no match', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .post('/api/group/88888888/user')
            .send({userid:'12345997'})
            .expect(204,done);
        });

        it('delete /api/group/:groupid/user returns 204 when no match', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .del('/api/group/99999775/user')
            .send({userid:'12345997'})
            .expect(204,done);
        });

        it('/api/group/membership/:userid/patient returns error when one has been raised', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/patient')
            .expect(204,done);
        });
    });

    describe('test errors returned', function() {

        var errorsFoundHelper;

        before(function(){

            var fakeMongoHandler,
                port,
                testConfig;

            port = 3400;
        
            testConfig  = {
                throwErrors : true,
                returnNone : false
            };
        
            fakeMongoHandler = require('./handler/FakeMongoHandler')(testConfig);
            errorsFoundHelper = fixture.testingHelper(false);
            errorsFoundHelper.initArmadaService(fakeMongoHandler,port);
        
        });

        after(function(){
            errorsFoundHelper.stopArmadaService();
        });

        it('post /api/group returns 500 and does not return error so we do not leak implemention details', function(done) {

            var testGroup =
            {
                name : 'test create for 201',
                owners: ['99999','222222'],
                members: ['99999','222222','33333212'],
                patient : '444444'
            };

            supertest(errorsFoundHelper.armadaServiceEndpoint())
            .post('/api/group')
            .send({group:testGroup})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('/api/group/membership returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsFoundHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/member')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });

        });

        it('/api/group/membership/:userid/owner returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsFoundHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/owner')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });

        });

        it('/api/group/membership/:userid/patient returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsFoundHelper.armadaServiceEndpoint())
            .get('/api/group/membership/33333/patient')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('/api/group/:groupid/user returns 500 and does not return error so we do not leak implemention details', function(done) {

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

        it('delete /api/group/:groupid/user returns 500 and does not return error so we do not leak implemention details', function(done) {

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

        it('/api/group/:groupid/patient 500 and does not return error so we do not leak implemention details', function(done) {

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