const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const unifiedServer = (req, res) => {
    const parsedURL = url.parse(req.url, true);
    const path = parsedURL.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    let decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    })

    res.on('end', () => {
        buffer += decoder.end();
        res.end('Server responded.\n\n');
        console.log(`Payload: ${buffer}`);
    })
}

const server = http.createServer((req, res) => {
    unifiedServer(req, res);
});

server.listen(3000, () => {
    console.log('Server is listening at 3000.');
})