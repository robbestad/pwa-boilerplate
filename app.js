const koa = require('koa');
const path = require('path');
const Boom = require('boom');
const favicon = require('koa-favicon');
const serveStatic = require('koa-static-plus');
const convert = require('koa-convert');
let router = require(path.join(__dirname, 'router'));
const app = new koa();
const root = path.join(__dirname, 'public');
const opts = {pathPrefix: '/'};

// Use router
app
  .use(convert(serveStatic(root), opts))
  .use(favicon(path.join(__dirname, 'public', 'assets', 'icons', 'favicon.ico')))
  .use(router.routes())
  .use(router.allowedMethods({
    throw: false,
    notImplemented: () => new Boom.notImplemented(),
    methodNotAllowed: () => new Boom.methodNotAllowed()
  }));

module.exports = app;
