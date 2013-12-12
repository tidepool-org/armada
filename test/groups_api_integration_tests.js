'use strict';

var should = require('chai').should(),
    supertest = require('supertest'),
    TestingSetup = require('./TestingSetup'),
    MongoHandler = require('../lib/handler/MongoHandler'),
    apiEndPoint,
    setup,
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
    },
    {
        name : 'test_deluser',
        owners: ['111'],
        members: ['111','88sjjs88'],
        patient : '99'
    }];

describe('message API', function() {

    before(function(){

        /*
        Setup
        */
        var config,
        crudHandler;

        config = require('../env');
        
        if(config.mongodb_connection_string == null){
            config.mongodb_connection_string = 'mongodb://localhost/tidepool-platform';
        }

        console.log('test config ',config);
        crudHandler = new MongoHandler(config);
        
        setup = new TestingSetup(crudHandler,config.port,true);
        testDbInstance = setup.mongoInstance();
        apiEndPoint = setup.localhostEndpoint();

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

        it('returns 400 when no data is sent', function(done) {

            supertest(apiEndPoint)
            .post('/api/group/create')
            .expect(400)
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

        it('id is valid', function(done) {

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
                setup.checkId(res.body.id).should.be.true;
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

        it('the groups should be valid', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/memberof/12345')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                var foundGroups = res.body.groups;

                foundGroups.forEach(function(group){
                    setup.checkGroup(group).should.be.true;
                });

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

        it('returns 200 and two groups', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/ownerof/3343')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                res.body.groups.length.should.equal(2);
                done();
            });
        });

        it('the two groups should be valid', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/ownerof/3343')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                var foundGroups = res.body.groups;

                foundGroups.forEach(function(group){
                    setup.checkGroup(group).should.be.true;
                });

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
            .post('/api/group/adduser/'+groupId)
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

            var fakeGroupId = setup.mongoId();
            var userToAdd = '12345997';

            supertest(apiEndPoint)
            .post('/api/group/adduser/'+fakeGroupId)
            .send({userid : userToAdd})
            .expect(204)
            .end(function(err, res) {
                if (err) return done(err);
                
                done();
            });
        });

    });

    describe('put /api/group/deluser/:groupid', function() {

        var testdelUserGroup;

        before(function(done){
            //Get existing group to use in tests 
            testDbInstance.groups.findOne({name:'test_deluser'},function(err, doc) {
                testdelUserGroup = doc;
                done();
            });
        });

        it('returns 200 when user is removed from the group', function(done) {

            var groupId = testdelUserGroup._id;
            var userToRemove = testdelUserGroup.members[1];

            supertest(apiEndPoint)
            .del('/api/group/deluser/'+groupId)
            .send({userid : userToRemove})
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                //get the group and check
                var updatedGroup = res.body.group;
                updatedGroup.members.should.not.contain(userToRemove);
                done();
            });
        });

        it('returns 204 when try to remove user from a group that does not exist', function(done) {

            var fakeGroupId = setup.mongoId();
            var userToRemove = '12345997';

            supertest(apiEndPoint)
            .del('/api/group/deluser/'+fakeGroupId)
            .send({userid : userToRemove})
            .expect(204)
            .end(function(err, res) {
                if (err) return done(err);
                
                done();
            });
        });

        it('returns 200 when try to remove a user that is not in the group anyway', function(done) {

            //i am just guessing????
            var groupId = testdelUserGroup._id;
            var userToRemove = '123xx45997';

            supertest(apiEndPoint)
            .del('/api/group/deluser/'+groupId)
            .send({userid : userToRemove})
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                done();
            });
        });

    });

    describe('get /api/group/getpatient/:groupid', function() {

        var testGroup;

        before(function(done){
            //Get existing group to use in tests 
            testDbInstance.groups.findOne({},function(err, doc) {
                testGroup = doc;
                done();
            });
        });

        it('returns 200 and the patient id when found', function(done) {

            var groupId = testGroup._id;
            var patientId = testGroup.patient;

            supertest(apiEndPoint)
            .get('/api/group/getpatient/'+groupId)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                //get the group and check
                res.body.patient.should.equal(patientId);
                done();
            });
        });

    });

});