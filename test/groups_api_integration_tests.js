'use strict';
/* jshint -W079 *//* jshint -W098 */
var should = require('chai').should(),
/* jshint +W079 *//* jshint +W098 */
    supertest = require('supertest'),
    mongojs = require('mongojs'),
    crud,
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
        members: ['99999','222222','4982883'],
        patient : '12345'
    },
    {
        name : 'medical',
        owners: ['3343','5555'],
        members: ['3343','5555','4982883'],
        patient : '12345'
    },
    {
        name : 'careteam',
        owners: ['3343','8898'],
        members: ['3343','8898','4982883'],
        patient : '8876'
    }];

describe('message API', function() {

    before(function(){ 

        var config,
        service,
        MongoHandler,
        crudHandler;

        MongoHandler = require('../lib/handler/MongoHandler');
        config = require('../env');
        service = require('../lib/ArmardaService');
    
        if(config.mongodb_connection_string === undefined || config.mongodb_connection_string === null){
            config.mongodb_connection_string = 'mongodb://localhost/tidepool-platform'
        }

        console.log('test config ',config);
        crudHandler = new MongoHandler(config);

        //lets get this party started
        service.start(crudHandler,config.port);

        /*
        Connections
        */
        apiEndPoint = 'http://localhost:'+config.port;
        testDbInstance = mongojs('mongodb://localhost/tidepool-platform', ['groups']);

        /*
        Clean and then load our test data
        */
        testDbInstance.groups.remove();

        testGroups.forEach(function(group) {
            testDbInstance.groups.save(group);
        });
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
                members: ['99999','222222'],
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
                members: ['99999','222222'],
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

    describe('get /api/group/memberof', function() {

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

    describe('get /api/group/ownerof', function() {

        it('returns 204 when no there is no groups', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/ownerof/12345')
            .expect(204)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
        });

        it('returns 200 and two groups when I ask for 3343', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/ownerof/3343')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.groups.length.should.equal(2);

                done();
            });
        });
    });

    describe('get /api/group/patient', function() {

        it('returns 204 when no there are no groups', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/patient/777777777')
            .expect(204)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
        });

        it('returns 200 and one groups when I ask for patient 8876', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/patient/8876')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.groups.length.should.equal(1);

                done();
            });
        });
    });

    describe('put /api/group/adduser/:groupid', function() {

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
            .put('/api/group/adduser/'+groupId)
            .send({userid : userToAdd})
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                //get the group and check
                var updatedGroup = res.body.group;
                updatedGroup.members.should.contain(userToAdd);
                done();
            });
        });

        it('returns 204 when try to add user to group that does not exist', function(done) {

            var fakeGroupId = mongojs.ObjectId().toString();
            var userToAdd = '12345997';

            supertest(apiEndPoint)
            .put('/api/group/adduser/'+fakeGroupId)
            .send({userid : userToAdd})
            .expect(204)
            .end(function(err, res) {
                if (err) return done(err);
                
                done();
            });
        });

    });   
});