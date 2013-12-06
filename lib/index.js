/*
 * == TIDEPOOL LICENSE ==
 * Copyright (C) 2013 Tidepool Project
 * 
 * This source code is subject to the terms of the Tidepool Open Data License, v. 1.0.
 * If a copy of the license was not provided with this file, you can obtain one at:
 *     http://tidepool.org/license/
 * 
 * == TIDEPOOL LICENSE ==
 */
 
(function() {
    'use strict';

    var groups,
        config,
        restify,
        server,
        port,
        log;

    restify = require('restify');

    config = require('../env');
    groups = require('./routes/groupsHttp')(config);
    log = require('./log.js')('index.js');
    
    port = config.port;

    server = restify.createServer({
        name: 'TidepoolGroups'
    });

    server.use(restify.fullResponse());
    server.use(restify.bodyParser());
    server.use(restify.queryParser());

    server.post('/api/group/create', groups.addGroup);
    server.get('/api/group/memberof/:userid',groups.memberOf);
    server.get('/api/group/ownerof/:userid',groups.ownerOf);

    log.info('Groups API server serving on port[%s]', port);
    server.listen(port);

}).call(this);
