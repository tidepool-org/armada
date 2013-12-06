'use strict';
/* jshint -W079 *//* jshint -W098 */
var should = require('chai').should(),
/* jshint +W079 *//* jshint +W098 */
    supertest = require('supertest'),
    mongojs = require('mongojs'),

    config = require('../env'),
    groupsService,
    apiEndPoint,
    testDbInstance,
    testGroups;

/*
    Dummy groups that we load for tests
*/
testGroups = [{
        name : 'family',
        owners: ['99999','222222'],
        patient : '12345'
    },
    {
        name : 'medical',
        owners: ['3343','5555'],
        patient : '12345'
    },
    {
        name : 'careteam',
        owners: ['3343','8898'],
        patient : '8876'
    }];

describe('message API', function() {

    before(function(){   
        /*
        Connections
        */
        apiEndPoint = 'http://localhost:3002/';
        testDbInstance = mongojs('mongodb://localhost/tidepool-platform', ['groups']);
        /*
        Cleanup previous runs then load our test data
        */
        testGroups.forEach(function(group) {
            testDbInstance.groups.save(group);
        });
        /*
        Kick-off the groups-api
        */
        groupsService = require('../lib/index.js');

    });

    after(function(){
        
        testDbInstance.groups.remove();

    });

    describe('post /api/group/create', function() {

        it('returns 400 when given an invalid group to create', function(done) {

            var testGroup = {
                nothing : ''
            };

            supertest(apiEndPoint)
            .post('/api/group/create')
            .send({group:testGroup})
            .expect(400)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
        });

        it('returns 201 when a group is created', function(done) {

            var testGroup = {
                name : 'test create for 201',
                owners: ['99999','222222'],
                patient : '444444'
            };

            supertest(apiEndPoint)
            .post('/api/group/create')
            .send({group:testGroup})
            .expect(201)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
        });

        it('returns id with 201 response', function(done) {

            var testGroup = {
                name : 'test create to get id',
                owners: ['99999','222222'],
                patient : '99999'
            };

            supertest(apiEndPoint)
            .post('/api/group/create')
            .send({group:testGroup})
            .expect(201)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.have.property('id');
                res.body.id.should.not.be.empty;
                done();
            });
        });

        it('returns 400 when no data is sent', function(done) {

            supertest(apiEndPoint)
            .post('/api/group/create')
            .expect(400)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
        });

    });

    describe('post /api/group/memberof', function() {


        it('returns 204 when no there is no groups', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/memberof/33333')
            .expect(204)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
        });

        it('returns 200 and two groups when I ask for 12345', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/memberof/12345')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.groups.length.should.equal(2);

                done();
            });
        });

    });

   
});