const server = require('./lib/server');
const workers = require('./lib/workers');

const app = {};

app.init = () => {

    /** Start the server */
    server.init();

    /** Start the workers */
    workers.init();
}

/** Executing app */
app.init();

module.exports = app;