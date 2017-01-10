const koa = require('koa');
const http = require('http');
const fs = require('fs');
const path = require('path');
const spdy = require('spdy');
const router = require('./router');
const app = require('./app');

const ports = {
  http: process.env.HTTP || 80,
  https: process.env.HTTPS || 443
};

const ssl = {
  key: process.env.PUBKEY || fs.readFileSync(path.join(__dirname, 'cert', 'server.key')),
  cert: process.env.CERT || fs.readFileSync(path.join(__dirname, 'cert', 'server.crt')),
};

// SSL options
const options = {
  key: ssl.key,
  spdy: {
    protocols: ['h2'],
    ssl: true,
    plain: false
  }
};

ssl.cert = process.env.CERT || fs.readFileSync(path.join(__dirname, 'cert', 'server.crt'));
if (ssl.cert) options.cert = ssl.cert;

// http server that will only be used as a redirect to SSL
http.createServer((req, res) => {
  res.writeHead(301, {
    "Location": "https://" + (req.headers['host'] + req.url)
      .replace(ports.http, ports.https)
      .replace(/:80$/, '')
      .replace(/:443$/, '')
  });
  res.end();
}).listen(ports.http);

// http2 server
spdy.createServer(options, app.callback()).listen(ports.https);