request = require('request');

module.exports = function(config,apiHost) {

	function checkToken(req, res, next) {

		var token = req.headers['x-tidepool-session-token'];

		var options = {
	    	url: apiHost+'/token/'+token,
	        method:'GET',
	    	headers: {
	        	'X-Tidepool-Session-Token': token
	    	}
	    };

    	request(options, function (error, response, body) {

    		if(error){
    			next(error);
    		}
    		if(!JSON.parse(body).userid){
    			req.headers['x-tidepool-session-token'] = null;
    		}
    	
    	});

	  	return next();
	};

	function getToken(req, res, next) {

		//console.log('do we need to get a token? ',req.headers['x-tidepool-session-token']);

		if(req.headers['x-tidepool-session-token']){
			//console.log('all good thanks, we have a valid token');
			next();
		} else {

			var options = {
		    	url: apiHost+'/serverlogin',
		        method:'POST',
		    	headers: {
		        	'X-Tidepool-Server-Name': config.serverName,
		        	'X-Tidepool-Server-Secret': config.serverSecret
		    	}
		    };

	    	request(options, function (error, response, body) {
	    		if(error){
	    			next(error);
	    		}
	    		res.header('x-tidepool-session-token', sessiontoken);
	    		//console.log('added the token');
	    	});

		  	return next();
	  	}
	};

	function getAllUsersForGroup(req, res, next){

		var users = [];
		console.log('get all users for  ',req.groupid);
		res.send(200,{members:users});
		next();
	};

	function getUser(req, res, next){

		console.log('get user');

		var token = req.headers['x-tidepool-session-token'];

		var options = {
	    	url: apiHost+'/user/'+req.userId,
	        method:'GET',
	    	headers: {
	        	'X-Tidepool-Session-Token': token
	    	}
	    };

	    request(options, function (error, response, body) {
	    	if(error){
	    		next(error);
	    	}
	    	console.log('got the user ',body);
	    	res.user = body;    
	    });
	    next();
	};

	return {
        checkToken : checkToken,
        getToken : getToken,
        getAllUsersForGroup : getAllUsersForGroup
    };

}