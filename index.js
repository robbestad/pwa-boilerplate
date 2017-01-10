const koa = require('koa');
const http = require('http');
const fs = require('fs');
const path = require('path');
const spdy = require('spdy');
const router = require('./router');
const app = require('./app');
const createServer = require("auto-sni");

const ports = {
  http: process.env.HTTP || 80,
  https: process.env.HTTPS || 443
};

const server = createServer({
  email: "robbestad@gmail.com", // Emailed when certificates expire.
  agreeTos: true, // Required for letsencrypt.
  debug: true, // Add console messages and uses staging LetsEncrypt server. (Disable in production)
  domains: ["robbestad.no", ["www.robbestad.no", "pwa.robbestad.no"]], // List of accepted domain names. (You can use nested arrays to register bundles with LE).
  forceSSL: true, // Make this false to disable auto http->https redirects (default true).
  redirectCode: 301, // If forceSSL is true, decide if redirect should be 301 (permanent) or 302 (temporary). Defaults to 302
  ports: {
    http: ports.http, // Optionally override the default http port.
    https: ports.https // // Optionally override the default https port.
  }
});

// Server is a "https.createServer" instance.
server.once("listening", ()=> {
  console.log("We are ready to go.");
});


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