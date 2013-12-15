'use strict';

var fixture = require('./fixtures.js'),
/*jshint unused:false */
    should = fixture.should,
    helper = fixture.testingHelper(true),
    testDbInstance,
    testGroups,
    mongoHandler;

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

describe('handleMongo', function() {

    before(function(){

        /*
        Setup
        */
        var config;

        config = require('../env');
        
        if(config.mongoDbConnectionString == null){
            config.mongoDbConnectionString = 'mongodb://localhost/tidepool-platform';
        }

        console.log('testing connection ',config.mongoDbConnectionString);

        mongoHandler = require('../lib/handler/MongoHandler')(config.mongoDbConnectionString);
        
        testDbInstance = helper.mongoTestInstance();
        
    });

    beforeEach(function(done){
        // keep mongo clean between runs 
        testDbInstance.groups.remove();

        testGroups.forEach(function(group) {
            testDbInstance.groups.save(group);
        });
        
        done();
    });

    it('createGroup ', function(done) {

        var dummyGroup = {
            name : 'createGroup test',
            owners: ['XX888S22'],
            members: ['XX888S22','DD55550'],
            patient : '1234XD5'
        };

        mongoHandler.createGroup(dummyGroup,function(error,id){
            if(error){
                return done(error);
            }
            id.should.not.equal('');
            helper.validateId(id).should.be.true;
            done();
        });

    });

    it('findGroupsPatientIn find one group valid for patient 99', function(done) {

        var patientId ='99';

        mongoHandler.findGroupsPatientIn(patientId,function(error,groups){
            if(error){
                return done(error);
            }
            groups.length.should.equal(1);
            var theGroup = groups[0];
            helper.validateGroup(theGroup).should.be.true;
            done();
        });

    });

    it('findGroupsMemberOf for user 3343 should return two valid groups', function(done) {

        var userId ='3343';

        mongoHandler.findGroupsMemberOf(userId,function(error,groups){
            if(error){
                return done(error);
            }
            groups.length.should.equal(2);
            groups.forEach(function(theGroup){
                helper.validateGroup(theGroup).should.be.true;
            });
            
            done();
        });

    });

    it('findGroupsOwnerOf for user 99999 should return one valid group', function(done) {

        var userId ='99999';

        mongoHandler.findGroupsOwnerOf(userId,function(error,groups){
            if(error){
                return done(error);
            }
            groups.length.should.equal(1);
            groups.forEach(function(theGroup){
                helper.validateGroup(theGroup).should.be.true;
            });
            
            done();
        });

    });

    it('addUserToGroup for user 002JHB77 should return one valid group that has included that user', function(done) {

        var userId ='002JHB77';

        var dummyGroup = {
            name : 'addUserToGroup test',
            owners: ['XX888S22'],
            members: ['XX888S22'],
            patient : '1234XD5'
        };

        mongoHandler.createGroup(dummyGroup,function(error,id){
            if(error){
                return done(error);
            }
            var userId ='002JHB77';
            var groupId = String(id);

            mongoHandler.addUserToGroup(groupId,userId,function(error,group){
                if(error){
                    return done(error);
                }
                helper.validateGroup(group).should.be.true;
                group.members.should.contain(userId);
            
                done();
            });
        });

    });

    it('removeUserFromGroup for user 007722B77DF should return one valid group that no longer contains that user', function(done) {

        var userId ='002JHB77';

        var dummyGroup = {
            name : 'removeUserFromGroup test',
            owners: ['XX888S22','007722B77DF'],
            members: ['XX888S22','007722B77DF'],
            patient : '1234XD5'
        };

        mongoHandler.createGroup(dummyGroup,function(error,id){
            if(error){
                return done(error);
            }
            var userId ='007722B77DF';
            var groupId = String(id);

            mongoHandler.removeUserFromGroup(groupId,userId,function(error,group){
                if(error){
                    return done(error);
                }
                helper.validateGroup(group).should.be.true;
                group.members.should.not.contain(userId);
                group.owners.should.not.contain(userId);
            
                done();
            });
        });

    });

    it('findPatientForGroup for group will return the patientId 002JHB77', function(done) {

        var patientId ='002JHB77';

        var dummyGroup = {
            name : 'findPatientForGroup test',
            owners: ['XX888S22','007722B77DF'],
            members: ['XX888S22','007722B77DF'],
            patient : patientId
        };

        mongoHandler.createGroup(dummyGroup,function(error,id){
            if(error){
                return done(error);
            }
            
            var groupId = String(id);

            mongoHandler.findPatientForGroup(groupId,function(error,patientId){
                if(error){
                    return done(error);
                }

                patientId.should.equal(patientId);
        
                done();
            });
        });

    });
        
});