/*
 * Copyright (c) 2014, Tidepool Project
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var log = require('../log.js')('groupsRoute.js');

/*
    Http interface for group-api
*/
module.exports = function(crudHandler) {

    /*
        Does this group have all the fields we require?
    */
    var groupIsValid = function(group){


        if (('name' in group && group.name !== '') &&
            ('owners' in group && group.owners.length > 0) &&
            ('members' in group && group.members.length > 0) &&
            ('patient' in group && group.patient !== '')) {

            return true;
        } else {
            log.warn('group must have the fields [name, owners, members, patient], got[%j]',group);
            return false;
        }
    };

    var addGroup = function(req, res, next) {
     
        log.debug('Request came in!  params[%j], url[%s], method[%s]', req.params, req.url, req.method);

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

    var ownerOf  = function(req, res, next) {
      
        log.debug('Request came in!  params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        var userId = req.params.userid;

        if(userId){
            crudHandler.findGroupsOwnerOf(userId,function(error,groups){
                if (error){
                    log.error(error, 'Error getting groups owned by user[%j]', userId);
                    res.send(500);
                } else {
                    if (groups.length>0){
                        res.send(200,{groups : groups});
                    } else {
                        res.send(204);
                    }
                }
            });
        } else {
            res.send(400);
        }

        return next();
    };

    var memberOf = function(req, res, next) {
     
        log.debug('Request came in!  params[%j], url[%s], method[%s]', req.params, req.url, req.method);

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

    var patientIn = function(req, res, next) {
      
        log.debug('Request came in!  params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        var userId = req.params.userid;

        if(userId){
            crudHandler.findGroupsPatientIn(userId,function(error,groups){
                if (error){
                    log.error(error, 'Error getting groups user[%s] is a patient in', userId);
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
      
        log.debug('Request came in!  params[%j], url[%s], method[%s]', req.params, req.url, req.method);

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
      
        log.debug('Request came in!  params[%j], url[%s], method[%s]', req.params, req.url, req.method);

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

    var patientForGroup = function(req, res, next) {
      
        log.debug('Request came in!  params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        var groupId = req.params.groupid;

        crudHandler.findPatientForGroup(groupId, function(error,patientId){
            if (error){
                log.error(error, 'Error finding the patient for group[%s]', groupId);
                res.send(500);
            } else {
            
                if (patientId){
                    res.send(200,{ patient : patientId });
                }else{
                    res.send(204);
                }
            }
        });

        return next();
    };

    var getAllInGroup = function(req, res, next) {
      
        log.debug('Request came in!  params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        res.send(501);

        return next();
    };

    var getAllUsers = function(req, res, next) {
      
        log.debug('Request came in!  params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        res.send(501);

        return next();
    };

    return {
        addGroup : addGroup,
        memberOf : memberOf,
        ownerOf : ownerOf,
        patientIn : patientIn,
        addToGroup : addToGroup,
        removeFromGroup : removeFromGroup,
        patientForGroup : patientForGroup,
        getAllInGroup : getAllInGroup,
        getAllUsers : getAllUsers
    };
};

