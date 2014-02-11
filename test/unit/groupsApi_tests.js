/*
== BSD2 LICENSE ==
Copyright (c) 2014, Tidepool Project

This program is free software; you can redistribute it and/or modify it under
the terms of the associated License, which is identical to the BSD 2-Clause
License as published by the Open Source Initiative at opensource.org.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the License for more details.

You should have received a copy of the License along with this program; if
not, you can obtain one from Tidepool Project at tidepool.org.
== BSD2 LICENSE ==
*/

'use strict';
var fixture = require('./../helpers/fixtures.js'),
/*jshint unused:false */
should = fixture.should,
supertest = fixture.supertest,
restify = require('restify'),
testGroup = fixture.testData.individual;
/*
============

Running the groups API

- mongo backend has been mocked

=============
*/
describe('Groups API', function() {

  /*
  minimise the components to just groups API and mocked crud handler
  */
  var setupAPI = function(crudHandler){

    var server = restify.createServer({name:'Groups API Tests'});
    server.use(restify.queryParser());
    server.use(restify.bodyParser());

    var groups = require('../../lib/routes/groupApi')(crudHandler);

    server.get('/status',groups.status);
    server.get('/membership/:userid/member', groups.memberOf);
    server.post('/', groups.addGroup);
    server.post('/:groupid/user', groups.addToGroup);
    server.del('/:groupid/user', groups.removeFromGroup);
    server.get('/:groupid', groups.getGroup);

    return server;
  };

  /*
  Testing the return codes are as expected a requested is processed as expected.
  */
  describe('requests processed as expected', function() {

    var groupsAPI;

    before(function(){

      var mockMongoHandler = require('./../mocks/mockMongoHandler')({
        throwErrors : false,
        returnNone : false
      });

      groupsAPI = setupAPI(mockMongoHandler);

    });

    it('GET /status returns 200', function(done) {
      supertest(groupsAPI)
      .get('/status')
      .expect(200,done);
    });

    it('GET /status returns 403 when status is passed as 403', function(done) {
      supertest(groupsAPI)
      .get('/status?status=403')
      .expect(403,done);
    });

    it('POST / returns 201', function(done) {

      var testGroup = {
        members: ['99999','222222','33333212']
      };

      supertest(groupsAPI)
      .post('/')
      .send({group:testGroup})
      .expect(201,done);

    });

    it('POST / returns id when created', function(done) {

      var testGroup = {
        members: ['99999','222222','33333212']
      };

      supertest(groupsAPI)
      .post('/')
      .send({group:testGroup})
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.property('id');
        done();
      });

    });

    it('POST / 400 when group is not sent', function(done) {

      supertest(groupsAPI)
      .post('/')
      .send({group:null})
      .expect(400,done);

    });

    it('GET /membership returns 200', function(done) {

      supertest(groupsAPI)
      .get('/membership/33333/member')
      .expect(200,done);
    });

    it('GET /membership returns an array of groups', function(done) {

      supertest(groupsAPI)
      .get('/membership/33333/member')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.property('groups');
        var groups = res.body.groups;
        groups.should.be.instanceof(Array);
        done();
      });
    });

    it('POST /:groupid/user returns 200', function(done) {
      supertest(groupsAPI)
      .post('/34444444/user')
      .send({userid:'12345997'})
      .expect(200,done);
    });

    it('POST /:groupid/user returns the updated group', function(done) {

      supertest(groupsAPI)
      .post('/34444444/user')
      .send({userid:'12345997'})
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.property('group');
        var group = res.body.group;
        group.should.property('id');
        group.should.property('members');
        done();
      });
    });

    it('DELETE /:groupid/user returns 204', function(done) {

      supertest(groupsAPI)
      .del('/34444444/user')
      .send({userid:'12345997'})
      .expect(204,done);
    });

    it('DELETE /:groupid/user returns the updated group', function(done) {

      supertest(groupsAPI)
      .del('/34444444/user')
      .send({userid:'12345997'})
      .expect(204)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.property('group');
        var group = res.body.group;
        group.should.property('id');
        group.should.property('members');
        done();
      });
    });

    it('GET /:groupid returns 200', function(done) {

      supertest(groupsAPI)
      .get('/34444444')
      .expect(200,done);
    });

    it('GET /:groupid returns the found group', function(done) {

      supertest(groupsAPI)
      .get('/34444444')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.property('group');
        var group = res.body.group;
        group.should.property('id');
        group.should.property('members');
        done();
      });
    });
  });

  /*
  Testing the return codes are as expected when there is no information to return for the
  given request.
  */
  describe('requests when no match for requested resource', function() {

    var groupsAPI;

    before(function(){

      var mockMongoHandler = require('./../mocks/mockMongoHandler')({
        throwErrors : false,
        returnNone : true
      });

      groupsAPI = setupAPI(mockMongoHandler);

    });

    it('GET /membership returns 204 when no data', function(done) {

      supertest(groupsAPI)
      .get('/membership/33333/member')
      .expect(204,done);
    });

    it('POST /:groupid/user returns 204 when no match', function(done) {

      supertest(groupsAPI)
      .post('/88888888/user')
      .send({userid:'12345997'})
      .expect(204,done);
    });

    it('DELETE /:groupid/user returns 404 when no match', function(done) {

      supertest(groupsAPI)
      .del('/99999775/user')
      .send({userid:'12345997'})
      .expect(404,done);
    });

    it('GET /:groupid returns 204 when no match', function(done) {

      supertest(groupsAPI)
      .get('/88888888888888')
      .expect(204,done);
    });

  });

  /*
  Testing the return codes are as expected when excpetions are raised as
  part of processing the request
  */
  describe('requests when an exception is raised as part of processing', function() {

    var groupsAPI;

    before(function(){

      var mockHandler = require('./../mocks/mockMongoHandler')({
        throwErrors : true,
        returnNone : false
      });

      groupsAPI = setupAPI(mockHandler);

    });

    it('GET /status returns 500 when there is an issue and tell me what is down', function(done) {

      supertest(groupsAPI)
      .get('/status')
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.not.property('error');
        res.body.should.have.property('down').with.length.greaterThan(0);
        done();
      });

    });

    it('POST  returns 500 and does not return error so we do not leak implemention details', function(done) {

      var groupToAdd = testGroup;


      supertest(groupsAPI)
      .post('/')
      .send({group:groupToAdd})
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.not.property('error');
        done();
      });
    });

    it('GET /membership returns 500 and does not return error so we do not leak implemention details', function(done) {

      supertest(groupsAPI)
      .get('/membership/33333/member')
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.not.property('error');
        done();
      });

    });

    it('POST /:groupid/user returns 500 and does not return error so we do not leak implemention details', function(done) {

      supertest(groupsAPI)
      .post('/33333/user')
      .send({userid:'12345997'})
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.not.property('error');
        done();
      });
    });

    it('DELETE /:groupid/user returns 500 and does not return error so we do not leak implemention details', function(done) {

      supertest(groupsAPI)
      .del('/33333/user')
      .send({userid:'12345997'})
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.not.property('error');
        done();
      });
    });

    it('GET /:groupid returns 500 and does not return error so we do not leak implemention details', function(done) {

      supertest(groupsAPI)
      .get('/88888888888888')
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.not.property('error');
        done();
      });
    });


  });

});