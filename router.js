const router = require('koa-router')();
const enforceHTTPS = require('./middleware/sslify');
const path = require('path');
const Boom = require('boom');

// Force SSL on all page
router
  .use(enforceHTTPS({port: 8091}))
// inner routes
  .get('/hello', function (ctx, next) {
    ctx.body = require(path.join(__dirname, 'routes', 'hello.js'))();
  })
  .get('/test', function (ctx, next) {
    ctx.body = require(path.join(__dirname, '..', 'src', 'index.html'))
  });

module.exports = router;
