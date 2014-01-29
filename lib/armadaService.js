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

var restify,
  server,
  log,
  servicePort;

restify = require('restify');

log = require('./log.js')('armadaService.js');

var armadaService = function (crudHandler, userApiHostGetter, envConfig) {

  //create the server depending on the type
  if (envConfig.httpPort != null) {
    servicePort = envConfig.httpPort;
    createServer({ name: 'TidepoolUserHttp' }, envConfig.userApi, crudHandler, userApiHostGetter);
  }

  if (envConfig.httpsPort != null) {
    servicePort = envConfig.httpsPort;
    createServer(_.extend({ name: 'TidepoolUserHttps'}, envConfig.userApi, crudHandler, userApiHostGetter));
  }

  return {
    stop: stopService,
    start: startService
  };

};

function createServer(serverConfig, userApiConfig, crudHandler, userApiHostGetter) {
  log.info('Creating server[%s]', serverConfig.name);
  server = restify.createServer(serverConfig);
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  var groupApi = require('./routes/groupApi')(crudHandler);

  var userApi = require('user-api-client');
  var userApiMiddleware = userApi.middleware(userApi.client(userApiConfig, userApiHostGetter));
  var checkToken = userApiMiddleware.checkToken.bind(userApiMiddleware);

  //health check
  server.get('/status', groupApi.status);

  //user membership
  server.get('/membership/:userid/member', checkToken, groupApi.memberOf);

  //updating
  server.post('/', checkToken, groupApi.addGroup);

  server.post('/:groupid/user', checkToken, groupApi.addToGroup);
  server.del('/:groupid/user', checkToken, groupApi.removeFromGroup);

  //group members
  server.get('/:groupid/members', checkToken, groupApi.getMembers);
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