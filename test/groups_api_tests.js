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

        it('/api/group/patient returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/patient/33333')
            .expect(200,done);
        });

        it('/api/group/adduser returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .post('/api/group/adduser/34444444')
            .send({userid:'12345997'})
            .expect(200,done);
        });

        it('/api/group/deluser returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .del('/api/group/deluser/34444444')
            .send({userid:'12345997'})
            .expect(200,done);
        });

        it('/api/group/patient returns 200 when all good', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/patient/34444444')
            .expect(200,done);
        });

        it('get /api/group/:groupid/members returns 501 as not yet implemented', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/34444444/members')
            .expect(501,done);
        });

        it('/api/group/allusers returns 501 as not yet implemented', function(done) {

            supertest(helper.armadaServiceEndpoint())
            .get('/api/group/allusers/34444444')
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

        it('/api/group/ownerof returns 204 when no data', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .get('/api/group/ownerof/33333')
            .expect(204,done);
        });

        it('/api/group/patient returns 204 when no data', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .get('/api/group/patient/33333')
            .expect(204,done);
        });

        it('/api/group/adduser returns 204 when no match', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .post('/api/group/adduser/88888888')
            .send({userid:'12345997'})
            .expect(204,done);
        });

        it('/api/group/deluser returns 204 when no match', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .del('/api/group/deluser/99999775')
            .send({userid:'12345997'})
            .expect(204,done);
        });

        it('/api/group/getpatient returns error when one has been raised', function(done) {

            supertest(noDataHelper.armadaServiceEndpoint())
            .get('/api/group/getpatient/33333')
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

        it('/api/group/ownerof returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsFoundHelper.armadaServiceEndpoint())
            .get('/api/group/ownerof/33333')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });

        });

        it('/api/group/patient returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsFoundHelper.armadaServiceEndpoint())
            .get('/api/group/patient/33333')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('/api/group/adduser returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsFoundHelper.armadaServiceEndpoint())
            .post('/api/group/adduser/33333')
            .send({userid:'12345997'})
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.property('error');
                done();
            });
        });

        it('/api/group/deluser returns 500 and does not return error so we do not leak implemention details', function(done) {

            supertest(errorsFoundHelper.armadaServiceEndpoint())
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

            supertest(errorsFoundHelper.armadaServiceEndpoint())
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