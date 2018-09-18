const http =  require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const routes = require('./routes');
const handlers = require('./requestHandlers');

const unifiedServer = (req, res) => {
    let parsedURL = url.parse(req.url, true);
    let path = parsedURL.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');
    let queryStringObject = parsedURL.query;
    let method = req.method.toLowerCase();
    let headers = req.headers;
    
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        }

        let chosenHandler = typeof(routes[trimmedPath]) !== 'undefined' ? routes[trimmedPath] : handlers.notFound;

        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 406;
            payload = typeof(payload) == 'object' ? payload : {}

            let payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            
            console.log("Returning this response: ", statusCode, payloadString);
        });
    });
}


const startServer = () => { 
    const server = http.createServer((req, res) => {
        unifiedServer(req, res);
    });

    server.listen(3000, () => {
        console.log('Server is listening at 3000.');
    })
}


module.exports = { startServer };