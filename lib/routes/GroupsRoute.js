'use strict';
/*
    Http interface for group-api
*/
module.exports = function(crudHandler) {

    var log = require('../log.js')('groupsHttp.js');

    /*
        Does this group have all the fields we require?
    */
    var groupToSaveIsValid = function(group){

        if (('name' in group && group.name !== '') &&
            ('owners' in group && group.owners.length > 0) &&
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

        if ( group && groupToSaveIsValid(group)){

            crudHandler.createGroup(group, function(error,id){
                if (error){
                    log.error(error);
                    res.send({'error':error});
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
                    res.send({'error':error});
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
                    res.send({'error':error});
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
                    res.send({'error':error});
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

    return {
        addGroup : addGroup,
        memberOf : memberOf,
        ownerOf : ownerOf,
        patientIn : patientIn
    };
};

