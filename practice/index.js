const server = require('./server');
const fileOps = require('./lib/fileOps');

/**
 * Starting HTTP and HTTPS servers.
 */
server.startServer();

fileOps.read('test', 'newFile', (data) => {
    console.log('Data ---> ', data);
});