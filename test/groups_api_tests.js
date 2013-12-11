'use strict';
/* jshint -W079 *//* jshint -W098 */
var should = require('chai').should(),
/* jshint +W079 *//* jshint +W098 */
    supertest = require('supertest'),
    service,
    apiEndPoint;

describe('message API', function() {

    describe('test normal route ', function() {

        var normalPathService,
        normalPathAPIEndPoint;

        before(function(){ 

            var config,
            FakeMongoHandler,
            fakeCrudHandler,
            port;

            port = 3400;

            FakeMongoHandler = require('./handler/FakeMongoHandler');
            normalPathService = require('../lib/ArmardaService');

            var testConfig  = {
                throwErrors : false,
                returnNone : false
            };
        
            fakeCrudHandler = new FakeMongoHandler(testConfig);

            //lets get this party started
            normalPathService.start(fakeCrudHandler,port);

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
            .put('/api/group/deluser/34444444')
            .send({userid:'12345997'})
            .expect(200,done);
        });

        it('/api/group/patient returns 200 when all good', function(done) {

            supertest(normalPathAPIEndPoint)
            .get('/api/group/patient/34444444')
            .expect(200,done);
        });
    });

    describe('test no data returned', function() {

        var noDataEndpoint,
        noDataFoundService;

        before(function(){ 

            var config,
            FakeMongoHandler,
            fakeCrudHandler,
            port;

            port = 3400;

            FakeMongoHandler = require('./handler/FakeMongoHandler');

            noDataFoundService = require('../lib/ArmardaService');
        
            var testConfig  = {
                throwErrors : false,
                returnNone : true
            };
        
            fakeCrudHandler = new FakeMongoHandler(testConfig);

            //lets get this party started
            noDataFoundService.start(fakeCrudHandler,port);

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
            .put('/api/group/deluser/99999775')
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

            var config,
            FakeMongoHandler,
            fakeCrudHandler,
            port;

            port = 3400;

            FakeMongoHandler = require('./handler/FakeMongoHandler');
            errorsFoundService = require('../lib/ArmardaService');
        
            var testConfig  = {
                throwErrors : true,
                returnNone : false
            };
        
            fakeCrudHandler = new FakeMongoHandler(testConfig);

            //lets get this party started
            errorsFoundService.start(fakeCrudHandler,port);

            errorsEndpoint = 'http://localhost:'+port;
        
        });

        after(function(){
            errorsFoundService.stop();
        });

        it('/api/group/create returns error when one has been raised', function(done) {

             var testGroup = {
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

                res.body.should.have.property('error');
                //res.body.error.should.not.be.empty;

                done();
            });
        });

        it('/api/group/memberof returns error when one has been raised', function(done) {

            supertest(errorsEndpoint)
            .get('/api/group/memberof/33333')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.should.have.property('error');
                //res.body.error.should.not.be.empty;

                done();
            });
        });

        it('/api/group/ownerof returns error when one has been raised', function(done) {

            supertest(errorsEndpoint)
            .get('/api/group/ownerof/33333')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.should.have.property('error');
                //res.body.error.should.not.be.empty;

                done();
            });
        });

        it('/api/group/patient returns error when one has been raised', function(done) {

            supertest(errorsEndpoint)
            .get('/api/group/patient/33333')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.should.have.property('error');
                //res.body.error.should.not.be.empty;

                done();
            });
        });

        it('/api/group/adduser returns error when one has been raised', function(done) {

            supertest(errorsEndpoint)
            .put('/api/group/adduser/33333')
            .send({userid:'12345997'})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.should.have.property('error');
                //res.body.error.should.not.be.empty;

                done();
            });
        });

        //deluser
        it('/api/group/deluser returns error when one has been raised', function(done) {

            supertest(errorsEndpoint)
            .put('/api/group/deluser/33333')
            .send({userid:'12345997'})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.should.have.property('error');
                //res.body.error.should.not.be.empty;

                done();
            });
        });

        it('/api/group/getpatient returns error when one has been raised', function(done) {

            supertest(errorsEndpoint)
            .get('/api/group/getpatient/33333')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.should.have.property('error');
                //res.body.error.should.not.be.empty;

                done();
            });
        });
    });

});