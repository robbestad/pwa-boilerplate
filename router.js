const router = require('koa-router')();
const path = require('path');
const send = require('koa-send');
const Boom = require('boom');

router
  .get("/health", async ctx => {
    await send(ctx, `health.html`)
  })

module.exports = router;
