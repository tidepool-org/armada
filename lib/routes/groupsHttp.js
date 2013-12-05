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

        if (group.name === undefined || group.name === ''){
            log.warn('group format is invalid given[%j].',group);
            return false;
        } else {
            return true;
        }
    };

    var addGroup = function(req, res, next) {
        log.debug('Request came in!  params[%j], url[%s], method[%s]', req.params, req.url, req.method);

        var group = req.params.group;

        if (groupToSaveIsValid(group)){
            try {
                var id = mongoGroups.createGroupInMongo(group);
                res.send(201,{id : id});
            } catch ( error ){
                log.error(error);
                res.send({'error':error});
            }
        } else {
            res.send(400);
        }
        return next();
    };

    return {
        addGroup: addGroup
    };
};

