'use strict';
/* jshint -W079 *//* jshint -W098 */
var should = require('chai').should(),
/* jshint +W079 *//* jshint +W098 */
    supertest = require('supertest'),
    mongojs = require('mongojs'),

    config = require('../env'),
    groupsService,
    apiEndPoint,
    testDbInstance;

describe('message API', function() {

    before(function(){
        /*
        Setup api and also load data for tests
        */
        apiEndPoint = 'http://localhost:3002/';
        testDbInstance = mongojs('mongodb://localhost/group-api', ['groups']);
        testDbInstance.groups.remove();
        groupsService = require('../lib/index.js');

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
                name : 'integration test',
                owners: ['99999','222222'],
                patient : '12345'
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

    });

   
});