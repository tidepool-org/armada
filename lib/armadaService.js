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

var _ = require('lodash');
var restify = require('restify');

var log = require('./log.js')('armadaService.js');

var server, servicePort;

/**
 * Check to see that the user making the request has permisson to see the data they are asking for
 *
 * @param envConfig - config for the service
 * @param crudHandler - handler for interaction with the CRUD layer
 * @param userApiClient - user API client
 * @param seagullHandler - handler for integartion with the seagull client
 *
 * @returns {{stop : stop, start : start }}
 */
var armadaService = function (envConfig, crudHandler, userApiClient, seagullHandler) {

  //create the server depending on the type
  if (envConfig.httpPort != null) {
    servicePort = envConfig.httpPort;
    createServer({ name: 'TidepoolUserHttp' },
      crudHandler,
      userApiClient,
      seagullHandler
    );
  }

  if (envConfig.httpsPort != null) {
    servicePort = envConfig.httpsPort;
    createServer(
      _.extend({ name: 'TidepoolUserHttps' }, envConfig.httpsConfig),
      crudHandler,
      userApiClient,
      seagullHandler
    );
  }

  return {
    stop: stopService,
    start: startService
  };

};

function createServer(serverConfig, crudHandler, userApiClient, seagullHandler) {
  log.info('Creating server[%s]', serverConfig.name);
  server = restify.createServer(serverConfig);
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  var groupApi = require('./routes/groupApi')(crudHandler);

  var userApiMiddleware = require('user-api-client').middleware;
  var checkToken = userApiMiddleware.checkToken(userApiClient);

  //checking permissions around message data
  var checkPermisson = seagullHandler.checkPermisson(userApiClient);

  //health check
  server.get('/status', groupApi.status);

  //user membership
  server.get('/membership/:userid/member', checkPermisson, checkToken, groupApi.memberOf);

  //updating
  server.post('/', checkPermisson, checkToken, groupApi.addGroup);

  server.put('/:groupid/user', checkPermisson, checkToken, groupApi.addToGroup);
  server.del('/:groupid/user', checkPermisson, checkToken, groupApi.removeFromGroup);

  //group members
  server.get('/:groupid/members', checkPermisson, checkToken, groupApi.getMembers);
}

function stopService() {
  log.info('Stopping the Groups API server');
  server.close();
}

function startService(cb) {
  log.info('Start Groups API server serving on port[%s]', servicePort);
  server.listen(servicePort, cb);
}

module.exports = armadaService;