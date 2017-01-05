const koa = require('koa');
const path = require('path');
const Boom = require('boom');

let router = require( path.join(__dirname, './router') );
const app = new koa();

// Use router
app
  .use(router.routes())
  .use(router.allowedMethods({
    throw: false,
    notImplemented: () => new Boom.notImplemented(),
    methodNotAllowed: () => new Boom.methodNotAllowed()
  }));

module.exports = app;
