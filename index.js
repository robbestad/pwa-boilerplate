const koa = require('koa');
const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('spdy');
const router = require('./router');
const app = require('./app');

const ports = {
  http: process.env.HTTP || 80,
  https: process.env.HTTPS || 443
};

const le = require('letsencrypt-express').create({
  server: 'staging' // in production use 'https://acme-v01.api.letsencrypt.org/directory'

  , configDir: require('os').homedir() + '/letsencrypt/etc'

  , approveDomains: function (opts, certs, cb) {
    opts.domains = certs && certs.altnames || opts.domains;
    opts.email = 'robbestad@gmail.com';
    opts.agreeTos = true;

    cb(null, {options: opts, certs: certs});
  }

  , debug: true
});

const server = https.createServer(le.httpsOptions, le.middleware(app.callback()));

server.listen(443, function () {
  console.log('Listening at https://localhost:' + this.address().port);
});

const redirectHttps = app.use(require('koa-sslify')()).callback();
http.createServer(le.middleware(redirectHttps)).listen(80, function () {
  console.log('handle ACME http-01 challenge and redirect to https');
});

// const createServer = require("auto-sni");
// const server = createServer({
//   email: "robbestad@gmail.com", // Emailed when certificates expire.
//   agreeTos: true, // Required for letsencrypt.
//   debug: true, // Add console messages and uses staging LetsEncrypt server. (Disable in production)
//   domains: ["robbestad.no", ["www.robbestad.no", "pwa.robbestad.no"]], // List of accepted domain names. (You can use nested arrays to register bundles with LE).
//   forceSSL: true, // Make this false to disable auto http->https redirects (default true).
//   redirectCode: 301, // If forceSSL is true, decide if redirect should be 301 (permanent) or 302 (temporary). Defaults to 302
//   ports: {
//     http: ports.http, // Optionally override the default http port.
//     https: ports.https // // Optionally override the default https port.
//   }
// });
//
// // Server is a "https.createServer" instance.
// server.once("listening", ()=> {
//   console.log("We are ready to go.");
// });
//

// const ssl = {
//   key: process.env.PUBKEY ? fs.readFileSync(process.env.PUBKEY) : fs.readFileSync(path.join(__dirname, 'cert', 'server.key')),
//   cert: process.env.CERT ? fs.readFileSync(process.env.CERT) : fs.readFileSync(path.join(__dirname, 'cert', 'server.crt')),
// };
//
// // SSL options
// const options = {
//   key: ssl.key,
//   cert: ssl.cert,
//   spdy: {
//     protocols: ['h2'],
//     ssl: true,
//     plain: false
//   }
// };
//
// // http server that will only be used as a redirect to SSL
// http.createServer((req, res) => {
//   res.writeHead(301, {
//     "Location": "https://" + (req.headers['host'] + req.url)
//       .replace(ports.http, ports.https)
//       .replace(/:80$/, '')
//       .replace(/:443$/, '')
//   });
//   res.end();
// }).listen(ports.http);
//
// // http2 server
// spdy.createServer(options, app.callback()).listen(ports.https);