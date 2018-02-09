const koa = require('koa');
const path = require('path');
const Boom = require('boom');
const favicon = require('koa-favicon');
const serveStatic = require('koa-static-plus');
const convert = require('koa-convert');
const bodyParser = require("koa-body")
const createLogger = require("./logger")
const config = require("./config")
const logger = createLogger.create(config)
const log = logger.child({component: "server"})

let rootRouter = require("./router");

const app = new koa();
const root = path.join(__dirname, 'public');
// const opts = {pathPrefix: '/'};
const opts = {};

// Use router
app
  .use(convert(serveStatic(root), opts))
  .use(bodyParser({multipart: true}))
  .use(rootRouter(logger).routes())
  .use(favicon(path.join(__dirname, 'public', 'assets', 'icons', 'favicon.ico')));

module.exports = app;
