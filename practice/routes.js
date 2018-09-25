const handlers = require('./requestHandlers');

/**
  * Routes and their corresponding handlers
  */  
let routes = {
    'hello': handlers.hello
};

module.exports = routes;