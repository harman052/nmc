const handlers = require('./lib/requestHandlers');

/**
  * Routes and their corresponding handlers
  */  
let routes = {
    'hello': handlers.hello,
    'users': handlers.users
};

module.exports = routes;