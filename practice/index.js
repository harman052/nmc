const server = require('./server');
const fileOps = require('./lib/fileOps');

/**
 * Starting HTTP and HTTPS servers.
 */
server.startServer();

fileOps.delete('test', 'newFile', (err) => {
    console.log('Err ---> ', err);
});