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

request = require('request');

module.exports = function(config,hostGetter) {

    function getAPIHost(){
        //we just want the first one in this instance
        var hostSpec = hostGetter.get();
        return hostSpec[0].host;
    }

    function checkToken(req, res, next) {

        var sessionToken = req.headers['x-tidepool-session-token'];

        var options = {
            url: getAPIHost()+'/token/'+sessionToken,
            method:'GET',
            headers: {
                'X-Tidepool-Session-Token': sessionToken
            }
        };

        request(options, function (error, response, body) {

            if(error){
                res.send(503);
                return next(error);
            }
            if(response.statusCode === 200 && JSON.parse(body).userid){
                res.userid = JSON.parse(body).userid;
                req.userid = JSON.parse(body).userid;
            } else {
                res.send(401);
            }

            return next();
            
        });
    };

    function getToken(req, res, next) {

        if(req.headers['x-tidepool-session-token'] == null){

            //no token so lets get one
            var options = {
                url: getAPIHost()+'/serverlogin',
                method:'POST',
                headers: {
                    'X-Tidepool-Server-Name': config.serverName,
                    'X-Tidepool-Server-Secret': config.serverSecret
                }
            };

            request(options, function (error, response, body) {

                if(error){
                    res.send(503);
                    return next(error);
                }

                console.log('## res from aking for token ## ',response);

                var sessionToken = response.headers['x-tidepool-session-token'];
                if(sessionToken && response.statusCode === 200){    
                    console.log('## set header ## ',sessionToken);
                    res.header('x-tidepool-session-token', sessionToken);
                    req.header('x-tidepool-session-token', sessionToken);
                }else{
                    res.send(401);
                }
                
            });

            return next();
        } else {
            res.header('x-tidepool-session-token',req.headers['x-tidepool-session-token']);
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

        var token = req.headers['x-tidepool-session-token'];

        var options = {
            url: apiHost+'/user/'+req.userid,
            method:'GET',
            headers: {
                'X-Tidepool-Session-Token': token
            }
        };

        request(options, function (error, response, body) {
            if(error){
                next(error);
            }
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