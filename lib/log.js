'use strict';

var _ = require('lodash');
var baseLog = require('bunyan').createLogger({name: 'groups-api'});

function createLogger(filename, extraObjects)
{
    
    /* jshint eqnull:true */
    if (extraObjects == null) {
    /* jshint eqnull:false */
        extraObjects = {};
    }

    var extras = _.cloneDeep(extraObjects);
    extras.srcFile = filename;

    return baseLog.child(extras);
}

module.exports = createLogger;