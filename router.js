const router = require('koa-router')();
const path = require('path');
const Boom = require('boom');

router
  .get('/hello', function (ctx, next) {
    ctx.body = require(path.join(__dirname, 'routes', 'hello.js'));
  })
  .get('/test', function (ctx, next) {
    ctx.body = require(path.join(__dirname, '..', 'src', 'index.html'))
  });

module.exports = router;
