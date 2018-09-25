const server = require('./server');
const fileOps = require('./lib/fileOps');

/**
 * Starting HTTP and HTTPS servers.
 */
server.startServer();

/**
 * Open file, create, if does not exist.
 */
fileOps.create('test', 'newFile', {"foo": "bar"}, (err) => {
    console.log('Error occurred ---> ', err);
});