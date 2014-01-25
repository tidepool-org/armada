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

var log = require('../log.js')('groupsApi.js');

/*
    Http interface for group-api
*/
module.exports = function(crudHandler) {

    /*
        HELPERS
    */

    //Does this group have all the fields we require?
    var groupIsValid = function(group){

        if (('members' in group && group.members.length > 0)) {

            return true;
        } else {
            log.warn('group must have the fields [members], got[%j]',group);
            return false;
        }
    };

    /*
        HEALTH CHECK 
    */

    var status =  function(req, res, next) {
        log.debug('status: params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        if (req.params.status) {
            res.send(parseInt(req.params.status));
        } else {
            crudHandler.status(function(error,result){
                log.info('returning status ' + result.statuscode);
                res.send(result.statuscode, result.deps);
            });
        }
        return next();
    };

    /*
        WORK
    */

    var addGroup = function(req, res, next) {
     
        log.debug('addGroup: params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        var group = req.params.group;

        if ( group && groupIsValid(group)){

            crudHandler.createGroup(group, function(error,id){
                if (error){
                    log.error(error, 'Error saving group[%j]', group);
                    res.send(500);
                } else {
                    res.send(201,{id : id});
                }
            });
        } else {
            res.send(400);
        }

        return next();
    };

    var memberOf = function(req, res, next) {
     
        log.debug('memberOf: params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        var userId = req.params.userid;

        if(userId){
            crudHandler.findGroupsMemberOf(userId,function(error,groups){
                if (error){
                    log.error(error, 'Error getting groups user[%s] is a member of', userId);
                    res.send(500);
                } else {
                    if (groups.length>0){
                        res.send(200,{groups : groups});
                    }else{
                        res.send(204);
                    }
                }
            });
        } else {
            res.send(400);
        }

        return next();
    };

    var addToGroup = function(req, res, next) {
      
        log.debug('addToGroup: params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        var groupId = req.params.groupid;
        var userId = req.params.userid;

        if(groupId && userId){
            crudHandler.addUserToGroup(groupId, userId, function(error,updatedGroup){
                if (error){
                    log.error(error, 'Error adding user[%s] to the group[%s]', userId, groupId);
                    res.send(500);
                } else {
                    if (updatedGroup && groupIsValid(updatedGroup)){
                        res.send(200,{group : updatedGroup});
                    }else{
                        res.send(204);
                    }
                }
            });
        } else {
            res.send(400);
        }

        return next();
    };

    var removeFromGroup = function(req, res, next) {
      
        log.debug('removeFromGroup: params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        var groupId = req.params.groupid;
        var userId = req.params.userid;

        if(groupId && userId){
            crudHandler.removeUserFromGroup(groupId, userId, function(error,updatedGroup){
                if (error){
                    log.error(error, 'Error removing user[%s] from group[%s]', userId, groupId);
                    res.send(500);
                } else {
                    if (updatedGroup && groupIsValid(updatedGroup)){
                        res.send(200,{group : updatedGroup});
                    }else{
                        res.send(204);
                    }
                }
            });
        } else {
            res.send(400);
        }

        return next();
    };

    var getGroup = function(req, res, next) {
      
        log.debug('getGroup: params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        var groupId = req.params.groupid;

        if(groupId){
            crudHandler.findGroup(groupId, function(error,foundGroup){
                if (error){
                    log.error(error, 'Error finding group[%s]', groupId);
                    res.send(500);
                } else {
                    if (foundGroup && groupIsValid(foundGroup)){
                        res.send(200,{group : foundGroup});
                    }else{
                        res.send(204);
                    }
                }
            });
        } else {
            res.send(400);
        }
        
        return next();
    };

    return {
        status : status,
        addGroup : addGroup,
        memberOf : memberOf,
        addToGroup : addToGroup,
        removeFromGroup : removeFromGroup,
        getGroup : getGroup
    };
};

