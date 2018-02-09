const router = require('koa-router')();
const path = require('path');
const send = require('koa-send');
const Boom = require('boom');
const fetch = require("isomorphic-fetch")
const fs = require("fs")

const uploadImage = ctx => {
  const file = ctx.request.body.files.file.path
  const stats = fs.statSync(file);
  const fileSizeInBytes = stats.size;
  let readStream = fs.createReadStream(file);

  console.log({stats, fileSizeInBytes})

  return fetch("https://acdc1801.azurewebsites.net/api/AnalyzeImage?code=Ia1NGr84GLvbfriXSu0z76tgvVaALhUvdaEm75gabchE7oJsBBCbOQ==",
    {
      method:  "POST",
      headers: {
        "Content-length": fileSizeInBytes
      },
      body:    readStream
    })
}

module.exports = function wrapper(logger) {
  const log = logger.child({
    component: "routes"
  })
  return router
    .get("/health", async ctx => {
      await send(ctx, `health.html`)
    })
    .post("/verifyPhoto", async ctx => {
      ctx.body = await uploadImage(ctx)
        .then(data => data.json())
        .then(resp => resp)
    })
}


