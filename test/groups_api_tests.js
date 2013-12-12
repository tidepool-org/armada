'use strict';

/*jshint unused: vars */
var should = require('chai').should(),
    supertest = require('supertest'),
    Armada = require('../lib/ArmadaService'),
    FakeMongoHandler = require('./handler/FakeMongoHandler');

describe('message API', function() {

    describe('test normal route ', function() {

        var normalPathService,
        normalPathAPIEndPoint;

        before(function(){

            var fakeCrudHandler,
            port;

            port = 3400;
            
            var testConfig  = {
                throwErrors : false,
                returnNone : false
            };
        
            fakeCrudHandler = new FakeMongoHandler(testConfig);
            normalPathService = new Armada(fakeCrudHandler,port);

            //lets get this party started
            normalPathService.start();

            //endpoint for service
            normalPathAPIEndPoint = 'http://localhost:'+port;
        
        });

        after(function(){
            normalPathService.stop();
        });

        it('/api/group/create 201 when all good', function(done) {

            var testGroup = {
                name : 'test create for 201',
                owners: ['99999','222222'],
                members: ['99999','222222','33333212'],
                patient : '444444'
            };

            supertest(normalPathAPIEndPoint)
            .post('/api/group/create')
            .send({group:testGroup})
            .expect(201,done);

        });

        it('/api/group/create 200 when all good', function(done) {

            var testGroup = {
                name : 'test create for 201',
                owners: ['99999'],
                members: ['99999','222222','33333212'],
                patient : '444444'
            };

            supertest(normalPathAPIEndPoint)
            .post('/api/group/create')
            .send({group:testGroup})
            .expect(201,done);
            
        });

        it('/api/group/memberof returns 200 when all good', function(done) {

            supertest(normalPathAPIEndPoint)
            .get('/api/group/memberof/33333')
            .expect(200,done);
        });

        it('/api/group/patient returns 200 when all good', function(done) {

            supertest(normalPathAPIEndPoint)
            .get('/api/group/patient/33333')
            .expect(200,done);
        });

        it('/api/group/adduser returns 200 when all good', function(done) {

            supertest(normalPathAPIEndPoint)
            .put('/api/group/adduser/34444444')
            .send({userid:'12345997'})
            .expect(200,done);
        });

        it('/api/group/deluser returns 200 when all good', function(done) {

            supertest(normalPathAPIEndPoint)
            .del('/api/group/deluser/34444444')
            .send({userid:'12345997'})
            .expect(200,done);
        });

        it('/api/group/patient returns 200 when all good', function(done) {

            supertest(normalPathAPIEndPoint)
            .get('/api/group/patient/34444444')
            .expect(200,done);
        });

        it('/api/group/member returns 501 as not yet implemented', function(done) {

            supertest(normalPathAPIEndPoint)
            .get('/api/group/members/34444444')
            .expect(501,done);
        });

        it('/api/group/allusers returns 501 as not yet implemented', function(done) {

            supertest(normalPathAPIEndPoint)
            .get('/api/group/allusers/34444444')
            .expect(501,done);
        });
    });

    describe('test no data returned', function() {

        var noDataEndpoint,
        noDataFoundService;

        before(function(){

            var fakeCrudHandler,
            port;

            port = 3400;
        
            var testConfig  = {
                throwErrors : false,
                returnNone : true
            };
        
            fakeCrudHandler = new FakeMongoHandler(testConfig);
            noDataFoundService = new Armada(fakeCrudHandler,port);

            //lets get this party started
            noDataFoundService.start();

            noDataEndpoint = 'http://localhost:'+port;
        
        });

        after(function(){
            noDataFoundService.stop();
        });

        it('/api/group/memberof returns 204 when no data', function(done) {

            supertest(noDataEndpoint)
            .get('/api/group/memberof/33333')
            .expect(204,done);
        });

        it('/api/group/ownerof returns 204 when no data', function(done) {

            supertest(noDataEndpoint)
            .get('/api/group/ownerof/33333')
            .expect(204,done);
        });

        it('/api/group/patient returns 204 when no data', function(done) {

            supertest(noDataEndpoint)
            .get('/api/group/patient/33333')
            .expect(204,done);
        });

        it('/api/group/adduser returns 204 when no match', function(done) {

            supertest(noDataEndpoint)
            .put('/api/group/adduser/88888888')
            .send({userid:'12345997'})
            .expect(204,done);
        });

        it('/api/group/deluser returns 204 when no match', function(done) {

            supertest(noDataEndpoint)
            .del('/api/group/deluser/99999775')
            .send({userid:'12345997'})
            .expect(204,done);
        });

        it('/api/group/getpatient returns error when one has been raised', function(done) {

            supertest(noDataEndpoint)
            .get('/api/group/getpatient/33333')
            .expect(204,done);
        });
    });

    describe('test errors returned', function() {

        var errorsEndpoint,
        errorsFoundService;

        before(function(){

            var fakeCrudHandler,
            port;

            port = 3400;
        
            var testConfig  = {
                throwErrors : true,
                returnNone : false
            };
        
            fakeCrudHandler = new FakeMongoHandler(testConfig);
            errorsFoundService = new Armada(fakeCrudHandler,port);

            //lets get this party started
            errorsFoundService.start();

            errorsEndpoint = 'http://localhost:'+port;
        
        });

        after(function(){
            errorsFoundService.stop();
        });

        it('/api/group/create returns 500 and does not return error so we do not leak implemention details', function(done) {

            var testGroup =
            {
                name : 'test create for 201',
                owners: ['99999','222222'],
                members: ['99999','222222','33333212'],
                patient : '444444'
            };

            supertest(errorsEndpoint)
            .post('/api/group/create')
            .send({group:testGroup})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('/api/group/memberof returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsEndpoint)
            .get('/api/group/memberof/33333')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });

        });

        it('/api/group/ownerof returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsEndpoint)
            .get('/api/group/ownerof/33333')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });

        });

        it('/api/group/patient returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsEndpoint)
            .get('/api/group/patient/33333')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('/api/group/adduser returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsEndpoint)
            .put('/api/group/adduser/33333')
            .send({userid:'12345997'})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('/api/group/deluser returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsEndpoint)
            .del('/api/group/deluser/33333')
            .send({userid:'12345997'})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('/api/group/getpatient 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsEndpoint)
            .get('/api/group/getpatient/33333')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });
    });

});