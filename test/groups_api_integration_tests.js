'use strict';

var fixture = require('./fixtures.js'),
/*jshint unused:false */
    should = fixture.should,
    supertest = fixture.supertest,
    testHelper = fixture.testingHelper,
    apiEndPoint,
    helper,
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
            mongoHandler;

        config = require('../env');
        
        if(config.mongoDbConnectionString == null){
            config.mongoDbConnectionString = 'mongodb://localhost/tidepool-platform';
        }

        console.log('testing connection ',config.mongoDbConnectionString);

        mongoHandler = require('../lib/handler/MongoHandler')(config.mongoDbConnectionString);
        
        helper = testHelper(mongoHandler,config.port,true);
        testDbInstance = helper.mongoTestInstance();
        apiEndPoint = helper.armadaServiceEndpoint();

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
                res.body.id.should.not.equal('');
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
                helper.validateId(res.body.id).should.equal(true);
                done();
            });
        });
        
    });

    describe('get /api/group/memberof', function() {

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
                    helper.validateGroup(group).should.equal(true);
                });

                done();
            });
        });
    });

    describe('get /api/group/ownerof', function() {

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
                    helper.validateGroup(group).should.equal(true);
                });

                done();
            });
        });
    });

    describe('get /api/group/patient', function() {

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

        it('the one group for patient is valid', function(done) {

            supertest(apiEndPoint)
            .get('/api/group/patient/8876')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                var foundGroups = res.body.groups;

                foundGroups.forEach(function(group){
                    helper.validateGroup(group).should.equal(true);
                });

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
            
                res.body.should.have.property('group');

                done();
            });
        });

        it('the updated group is returned with the new user and is valid', function(done) {

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
                helper.validateGroup(updatedGroup).should.equal(true);

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

        it('returns 200 and the updated group when user is removed from the group', function(done) {

            var groupId = testdelUserGroup._id;
            var userToRemove = testdelUserGroup.members[1];

            supertest(apiEndPoint)
            .del('/api/group/deluser/'+groupId)
            .send({userid : userToRemove})
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.have.property('group');
                done();
            });
        });

        it('the updated group does not contain the user and is valid', function(done) {

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

                helper.validateGroup(updatedGroup).should.equal(true);

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
            .expect(200,done());
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