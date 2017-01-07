const router = require('koa-router')();
const forceSSL = require('koa-sslify');
const path = require('path');
const Boom = require('boom');

// Force SSL on all page
router
  .use(forceSSL());

router
  .get('/', function (ctx, next) {
    ctx.body = require(path.join(__dirname, 'routes', 'welcome.js'))();
  })
  .get('/hello', function (ctx, next) {
    ctx.body = require(path.join(__dirname, 'routes', 'hello.js'))();
  })
  .get('/test', function (ctx, next) {
    ctx.body = require(path.join(__dirname, '..', 'src', 'index.html'))
  });

module.exports = router;
