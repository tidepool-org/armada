'use strict';
module.exports = (function(){
    var env = {};

    // The port for the server to listen on.
    env.port = process.env.PORT || 3002;

    //connection to mongo
    env.mongoDbConnectionString = process.env.MONGO_CONNECTION_STRING || null;

    return env;
})();
