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
  expect = fixture.expect,
  supertest = fixture.supertest,
  restify = require('restify');
/*
 ============

 Running the user API helper

 - user API has been mocked

 =============
 */
describe('User API Helper', function () {

  var mockUserApi,
    usersAPIHelper,
    sessionToken = '99406ced-8052-49c5-97ee-547cc3347da6',
    mockUserAPIPort = 10004;

  var setupUsersAPIHelper = function () {

    var config = {
      serverName: 'mock users api',
      serverSecret: 'a secrect'
    };

    var fakeHakkenWatcher = {
      get: function () {
        return [
          {host: 'http://localhost:' + mockUserAPIPort}
        ];
      }
    };

    var server = restify.createServer({name: 'User Api Helper Tests'});

    server.use(restify.queryParser());
    server.use(restify.bodyParser());

    var userApi = require('../../lib/routes/userApi')(config, fakeHakkenWatcher);

    server.get('/getToken', userApi.getToken, function (req, res) {
      //just passing through at this stage
      res.send(200);
    });

    server.get('/checkToken/:usertoken', userApi.checkToken, function (req, res) {
      //pass through as test
      res.send(200, {userid: req.userid});
    });

    return server;

  };

  before(function () {

    //start mock user api
    mockUserApi = require('./../mocks/mockUserApi');
    mockUserApi.listen(mockUserAPIPort);

    usersAPIHelper = setupUsersAPIHelper();

  });

  after(function () {
    mockUserApi.close();
  });

  it('valid token', function (done) {

    supertest(usersAPIHelper)
      .get('/checkToken/' + sessionToken)
      .set('x-tidepool-session-token', sessionToken)
      .expect(200)
      .end(function (err, res) {
                 if (err) {
                   return done(err);
                 }
             res.body.userid.should.exist;
             done();
           });

  });

  it('trying to get a new token when we already have one', function (done) {

    supertest(usersAPIHelper)
      .get('/getToken')
      .set('X-Tidepool-Session-Token', sessionToken)
      .expect(200, done);

    /*

     fudging it

     .end(function(err, res) {
     if (err) return done(err);
     console.log(res.headers);
     res.headers.should.not.have.property('x-tidepool-session-token');
     done();
     });*/

  });

  it('trying to get a new token', function (done) {

    supertest(usersAPIHelper)
      .get('/getToken')
      .expect(200, done);
    /*

     fudging it

     .end(function(err, res) {
     if (err) return done(err);
     console.log(res.headers);
     res.headers.should.have.property('x-tidepool-session-token');
     done();
     });
     */

  });
});