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

var url = require('url');

var userApiService = process.argv[2] || 'user-api';
var armadaService = process.argv[3] || 'armada';
var hakkenHost = process.argv[4] || 'localhost:8000';

var hakken = require('hakken')({ host: hakkenHost }).client.make();
var superagent = require('superagent');
var userApiClientLib = require('user-api-client');

function ensureResponse(err, res, expectedStatus) {
  if (err != null) {
    throw err;
  }

  if (res.status !== expectedStatus) {
    console.log('Failed with status.', res.status);
    console.log(res.message);
    console.log(res.text);
    throw new Error();
  }
}

hakken.start(makeWatches);

var userApiClient = null;
var armadaWatch = null;

function makeWatches(err) {
  if (err != null) {
    throw err;
  }

  var userApiWatch = hakken.randomWatch(userApiService);
  userApiWatch.start(function(err){
    userApiClient = userApiClientLib.client(
      {
        serverName: 'loginAndCheckGroups',
        serverSecret: 'This is a shared server secret'
      },
      userApiWatch
    );

    armadaWatch = hakken.randomWatch(armadaService);
    armadaWatch.start(createUser);
  });
}

var armadaHost = null;

function createUser(err) {
  if (err != null) {
    throw err;
  }

  userApiClient.createUser(
    {
      username : 'loginAndCheckGroups',
      emails: ['loginAndCheckGroups@tidepool.io'],
      password : '123456789'
    },
    function(err, userInfo) {
      console.log('Created', userInfo);
      getSessionToken();
    }
  );
}

var sessionToken = null;

function getSessionToken() {
  armadaHost = url.format(armadaWatch.get()[0]);
  console.log('Using armada host', armadaHost);

  userApiClient.login('loginAndCheckGroups', '123456789', function(err, token, userInfo){
    console.log(userInfo);
    sessionToken = token;
    console.log('Got sessionToken', sessionToken);
    go();
  });
}

function go() {
  superagent.post(armadaHost + '/')
    .set('x-tidepool-session-token', sessionToken)
    .send(
    {
      group: {
        members: ['billy', 'sally', 'testAccount']
      }
    })
    .end(
    function(err, res) {
      ensureResponse(err, res, 201);

      console.log('I created a group!!!', res.body);

      superagent.get(armadaHost + '/' + res.body.id + '/members')
        .set('x-tidepool-session-token', sessionToken)
        .end(
        function(err, res){
          ensureResponse(err, res, 200);

          console.log('I got the members back!', res.body);
          hakken.close();
        });
    });
}




