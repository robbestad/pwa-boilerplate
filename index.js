const koa = require('koa');
const http = require('http');
const fs = require('fs');
const forceSSL = require('koa-sslify');
const path = require('path');
const spdy  = require('spdy');

const app = koa();

// Force SSL on all page
app.use(forceSSL(8081));

// index page
app.use(function * (next) {
  this.body = "hello world from " + this.request.url;
});

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
http.createServer(app.callback()).listen(8080);

// http2 server
spdy.createServer(options, app.callback()).listen(8081);
