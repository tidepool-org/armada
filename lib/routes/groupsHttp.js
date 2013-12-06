'use strict';
/*
    Http interface for group-api CRUD operations
*/
module.exports = function(config) {

    var log = require('../log.js')('groupsHttp.js');
    var mongoGroups = require('./groupsViaMongo.js')(config);

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

            mongoGroups.createGroup(group, function(error,id){
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

    var memberOf = function(req, res, next) {
        log.debug('Request came in!  params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        var userId = req.params.userid;
console.log('memberof for ',userId);
        if(userId){
            mongoGroups.findGroupsMemberOf(userId,function(error,groups){
                if (error){
                    log.error(error);
                    res.send({'error':error});
                } else {
console.log('groups ',groups);                    
                    if (groups.length>0){
                        res.send(200,{memberof : groups});
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
        addGroup: addGroup,
        memberOf: memberOf
    };
};

