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

var fixture = require('./helpers/fixtures'),
    userApi = require('./mocks/mockUserApi'),
    should = fixture.should,
    helper = fixture.armadaTestHelper,
    userHandler;

describe('userHandler', function() {

    before(function(){

        userHandler = require('../lib/handler/userHandler')(helper.testConfig,'http://localhost:10002');
        //mocked user api that run
        userApi.listen('10002');
        
    });

    after(function(){
        userApi.close();
    });

    it('login server will return me a token ', function(done) {

        userHandler.loginServerAndGetToken(function(error,token){
             if(error){
                return done(error);
            }

            token.should.match(/[a-zA-Z0-9.]+/);
            
            done();
        });
    });

    it('get user will return me user for given id', function(done) {

        userHandler.getUser('22222-3333-4444',helper.sessiontoken,function(error,user){
            if(error){
                return done(error);
            }

            //make sure something is returned 
            user.should.be.ok;

            done();
        });
    });
        
});