/**
 * Routes handlers
 */
let handlers = {};

/**
 * hello router handler
 */
handlers.hello = (data, callback) => {
    callback(200, {'Message':'Welcome to the NodeJS Master Class!'});
}

/**
 * Use this handler in case of invalid route 
 */
handlers.notFound = (data, callback) => {
    callback(404, {'Message':'Invalid URL.'});
}

module.exports = handlers;