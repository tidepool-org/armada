'use strict';

var log = require('../log.js')('groupsHttp.js');

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
            log.warn('group format is invalid given[%j].',group);
            return false;
        }
    };

    var addGroup = function(req, res, next) {
     
        log.debug('Request came in!  params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        var group = req.params.group;

        if ( group && groupIsValid(group)){

            crudHandler.createGroup(group, function(error,id){
                if (error){
                    log.error(error);
                    res.send(500,{error : error});
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
                    log.error(error);
                    res.send(500,{error : error});
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

    var memberOf = function(req, res, next) {
     
        log.debug('Request came in!  params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        var userId = req.params.userid;

        if(userId){
            crudHandler.findGroupsMemberOf(userId,function(error,groups){
                if (error){
                    log.error(error);
                    res.send(500,{error : error});
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
                    log.error(error);
                    res.send(500,{error : error});
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
                    log.error(error);
                    res.send(500,{error : error});
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
                    log.error(error);
                    res.send(500,{error : error});
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
                log.error(error);
                res.send(500,{error : error});
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

