module.exports = function(crudHandler) {

	function checkToken(req, res, next) {

		var token = req.headers['x-tidepool-session-token'];

		//if(token){
		//	console.log('sweet bro');		
		//}else{
			console.log('not sweet bro');	
			req.getToken = true;
		//}
	  	next();
	};

	function getToken(req, res, next) {

		if(req.getToken){
			console.log('get a new token');
		}
	  	next();
	};

	return {
        checkToken : checkToken,
        getToken : getToken
    };

}