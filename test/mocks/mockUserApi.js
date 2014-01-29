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
 
var restify = require('restify'), 
	sessiontoken = '99406ced-8052-49c5-97ee-547cc3347da6',
	mockUserApi,
	user;

//fake user we will return 
user = {
	userid: 'a3d6a658-6e6a-401b-bcb3-c99268ba1804',
  	username: 'realname',
  	emails: ['foo@bar.com','myfoo@bar.org'],
  	password: 'R6LvLQ$=aTBgfj&4jqAq'
};

//basic setup
mockUserApi = restify.createServer({name: 'TidepoolUserMock'});
mockUserApi.use(restify.queryParser());
mockUserApi.use(restify.bodyParser());

//mock the end points we care about
mockUserApi.post('/serverlogin', function(req, res, next) {
	var server = req.headers['x-tidepool-server-name'];
    var pw = req.headers['x-tidepool-server-secret'];

    if((server && pw)){
		res.header('x-tidepool-session-token', sessiontoken);
		res.send(200,'machine login');
		return next();    	
    }

    res.send(401, 'Server identity not validated!');
    return next();
  
});

mockUserApi.get('/user/:id', function(req, res, next) {
	var token = req.headers['x-tidepool-session-token'];

	if(token){
		res.send(200,user);
		return next();
	}

	res.send(401, 'Unauthorized');
	return next();
  
});

mockUserApi.get('/token/:usertoken', function(req, res, next) {
	var token = req.params.usertoken;

	if(token){
		res.send(200,{userid: user.userid});
		return next();
	}

	res.send(401, 'Unauthorized');
	return next();
  
});

module.exports = mockUserApi;
