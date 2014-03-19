// == BSD2 LICENSE ==
// Copyright (c) 2014, Tidepool Project
//
// This program is free software; you can redistribute it and/or modify it under
// the terms of the associated License, which is identical to the BSD 2-Clause
// License as published by the Open Source Initiative at opensource.org.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE. See the License for more details.
//
// You should have received a copy of the License along with this program; if
// not, you can obtain one from Tidepool Project at tidepool.org.
// == BSD2 LICENSE ==

'use strict';

var log = require('../log.js')('seagullHandler.js');
var _ = require('lodash');

/*
 Handler for seagull interactions
*/
module.exports = function(seagullClient) {

  var dependencyStatus = { running: false, deps: { up: [], down: [] } };

  //assume its up to start with
  dependencyStatus = isUp(dependencyStatus);

  /*
    Seagull is down
  */
  function isDown(status){
    status.deps.up = _.without(status.deps.up, 'seagull');
    status.deps.down = _.union(status.deps.down, ['seagull']);
    return status;
  }

  /*
    Seagull is up
  */
  function isUp(status){
    status.deps.down = _.without(status.deps.down, 'seagull');
    status.deps.up = _.union(status.deps.up, ['seagull']);
    return status;
  }

  return {
    /**
     * status for the underlying seagull service
     * @returns callback
     */
    status: function status(callback) {
      log.debug('checking status');
      return callback(null, dependencyStatus);
    },

    /**
     * Check to see that the user making the request has permisson to see the data they are asking for
     * @returns {{checkPermisson: checkPermisson}}
     */
    checkPermisson: function(userApiClient) {
      var sessionTokenHeader = 'x-tidepool-session-token';

      return function(req, res, next) {

        console.log('request was ',req.headers[sessionTokenHeader]);

        userApiClient.withServerToken(function(error,serverToken){

          if(serverToken){
            log.info('using the server token for calls');
            req.headers[sessionTokenHeader] = serverToken;

console.log('request now ',req.headers[sessionTokenHeader]);
          }
          return next();
        });
      };
    }
  };
};