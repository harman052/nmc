const http =  require('http');
const https =  require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const routes = require('./routes');
const handlers = require('./requestHandlers');
const config = require('./config');
const fs = require('fs');


/**
 * Common function that parses URL and
 * create http and https server.
 * 
 * @param {*} req request object
 * @param {*} res response object
 */
const unifiedServer = (req, res) => {

    /**
     * Parse URL. 
     * 
     * 'true' parameter gets the query string 
     * parameters as the property of parsedURL. 
     */
    let parsedURL = url.parse(req.url, true);

    /**
     * Get the path. e.g. domain.com/pageA/
     * Here path is pageA/
     */
    let path = parsedURL.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');
    let queryStringObject = parsedURL.query;

    /** Get the http method used to send request */
    let method = req.method.toLowerCase();

    /** Get request headers */
    let headers = req.headers;
    
    /**
     * To decode payload (if any), stringDecoder is used.
     */
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    /**
     * Since payloads arrive to destination servers
     * in pieces (data stream), whenever a stream of 
     * payload reaches server, "data" event is triggered
     * which can used to collect payload bits. 
     */
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    /**
     * Whether there is a payload or not, "end" event
     * will always trigger. If there is a payload, this 
     * marks the end of payload data.
     */
    req.on('end', () => {
        buffer += decoder.end();

        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        }
        
        /** 
         * If no route handler found, pass request to 
         * "not found" handler. 
         * */
        let chosenHandler = typeof(routes[trimmedPath]) !== 'undefined' ? routes[trimmedPath] : handlers.notFound;

        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 406;
            payload = typeof(payload) == 'object' ? payload : {}

            let payloadString = JSON.stringify(payload);

            /**
             * Setting content type of response as application/JSON so 
             * that browsers could parse it as JSON object.
             */
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            
            console.log("Returning this response: ", statusCode, payloadString);
        });
    });
}


const startServer = () => { 
    const httpServer = http.createServer((req, res) => {
        unifiedServer(req, res);
    });

    /**
     * Starts the HTTP server.
     */
    httpServer.listen(config.httpPort, () => {
        console.log(`HTTP server is listening at port 
        ${config.httpPort} in ${config.envName} environment.`);
    })

    /**
     * Instantiate HTTPS server. 
     */
    const httpsServerOptions = {
        'key': fs.readFileSync('./practice/https/key.pem'),
        'cert': fs.readFileSync('./practice/https/cert.pem')
    };

    const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
        unifiedServer(req, res);
    });

    /**
     * Starts the HTTPS server.
     */
    httpsServer.listen(config.httpsPortt, () => {
        console.log(`HTTPS server is listening at port 
        ${config.httpsPort} in ${config.envName} environment.`);
    })
}

/**
 * Make this module available to other modules.
 */
module.exports = { startServer };