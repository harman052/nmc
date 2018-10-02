const handlers = require('./lib/requestHandlers');

/**
  * Routes and their corresponding handlers
  */  
let routes = {
    'hello': handlers.hello,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
};

module.exports = routes;