'use strict';

var _ = require('lodash');
var baseLog = require('bunyan').createLogger({name: 'groups-api'});

function createLogger(filename, extraObjects)
{
	/* jshint -W041 */
	//null needs to be tested in this way
    if (extraObjects == null) {
        extraObjects = {};
    }
    /* jshint +W041 */

    var extras = _.cloneDeep(extraObjects);
    extras.srcFile = filename;

    return baseLog.child(extras);
}

module.exports = createLogger;