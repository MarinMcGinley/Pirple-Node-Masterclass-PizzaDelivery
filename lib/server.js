const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const handlers = require('./handlers');



const server = {};

server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});

server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res);
})

server.unifiedServer = (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    const queryStringObject = parsedUrl.query;

    const method = req.method.toUpperCase();

    const headers = req.headers;

    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', (end) => {
        buffer += decoder.end();

        const route = typeof(server.handlers[trimmedPath] == 'undefined' ? server.handlers[trimmedPath] : server.handlers['notFound']);

    });
};

server.router = {
    'notFound': handlers.notFound(),
    'users': handlers.users(),
    'tokens': handlers.tokens(),
    'hello': handlers.hello(),
};

server.init = () => {
    server.httpServer();
    server.httpsServer();
};


module.exports = server;
