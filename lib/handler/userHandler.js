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

var log = require('../log.js')('usersHandler.js'),
	request = require('request'),
	userApiHost,
	config;

var userHandler = function(envConfig, host) {

	config = envConfig;
	userApiHost = host;

    return {
        loginServerAndGetToken : loginServerAndGetToken,
        getUser : getUser
    };
};

function loginServerAndGetToken(callback){

	var userAPILogin = userApiHost+'/serverlogin';
	var options = {
    	url: userAPILogin,
        method:'POST',
    	headers: {
        	'X-Tidepool-Server-Name': config.serverName,
        	'X-Tidepool-Server-Secret': config.serverSecret
    	}
    };

    request(options, function (error, response, body) {
        if(error){
            return callback(error,null);
        }
        var token = response.headers['x-tidepool-session-token'];
        return callback(null,token);
    });

};

function getUser(userId, token, callback){

	var userAPIGetUser = userApiHost+'/user/'+userId;

	var options = {
    	url: userAPIGetUser,
        method:'GET',
    	headers: {
        	'X-Tidepool-Session-Token': token
    	}
    };

    request(options, function (error, response, body) {
        if(error){
            callback(error,null);
        }
        callback(null,body);
    });
};

module.exports = userHandler;