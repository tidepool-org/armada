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
    var config,
    service,
    mongoHandler,
    mongoCrudHandler;

    config = require('../env');
    mongoHandler = require('./handler/MongoHandler');
    mongoCrudHandler = mongoHandler(config);

    service = require('./ArmadaService')(mongoCrudHandler,config.port);

    //lets get this party started
    service.start();

}).call(this);
