const koa = require('koa');
const http = require('http');
const fs = require('fs');
const path = require('path');
const spdy  = require('spdy');
const router = require('./router');
const app = require('./app');

const ports = {
  http: process.env.HTTP || 80,
  https: process.env.HTTPS || 443
}

// SSL options
const options = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'server.crt')),
  spdy: {
    protocols: ['h2'],
    ssl: true,
    plain: false
  }
}

// http server that will only be used as a redirect to SSL
http.createServer(app.callback()).listen(ports.http);

// http2 server
spdy.createServer(options, app.callback()).listen(ports.https);
