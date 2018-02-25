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
  // console.log({stats, fileSizeInBytes})
  return fetch("https://acdc1801.azurewebsites.net/api/AnalyzeImage?code=Ia1NGr84GLvbfriXSu0z76tgvVaALhUvdaEm75gabchE7oJsBBCbOQ==",
    {
      method:  "POST",
      headers: {
        "Content-length": fileSizeInBytes
      },
      body:    readStream
    })
}

const fetchPersons = ctx => {
  return fetch("https://acdc1801.azurewebsites.net/api/GetFaceAPIPersons?code=Ok/L3nF14iQHcjx5VbD3BZ5B0dXnXlctFTuthlO9YR0dnH8epaHPog==",
    {
      method:  "GET",
      headers: {
        "Content-type": "application/json"
      }
    })
}

const createTransaction = async (ctx, log) => {
  const senderId = ctx.request.body.senderId
  const messengerId = ctx.request.body.messengerId
  const receiverId = ctx.request.body.receiverId
  log.debug({senderId})
  log.debug({messengerId})
  log.debug({receiverId})
  const res = await fetch("https://acdc1801.azurewebsites.net/api/CreateTransaction?code=f17edus3LPdkulsVeCYs2c0bHh8/qEJidiBepoTpWaRINchMm3mQkw==",
    {
      method:  "POST",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body:    JSON.stringify({
        senderId,
        messengerId,
        receiverId
      })
    })
  return {status: res.status, text: res.statusText}
}

const uploadMessage = async (ctx, log) => {
  const message = ctx.request.body.message
  const receiverId = ctx.request.body.receiverId
  return await fetch("https://acdc1801.azurewebsites.net/api/GenerateQRCode?code=AQ3ood5t6UqTZaAl0eFf3O9VMZdsIzKF910Rc4F0GmCQT7fqXM278A==",
    {
      method:  "POST",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body:    JSON.stringify({
        receiverId: receiverId,
        text:       message.trim()
      })
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
    .get("/messengers", async ctx => {
      ctx.body = await fetchPersons(ctx)
        .then(data => data.json())
        .then(resp => resp)
    })
    .post("/verifyPhoto", async ctx => {
      ctx.body = await uploadImage(ctx)
        .then(data => data.json())
        .then(resp => resp)
    })
    .post("/createTransaction", async ctx => {
      ctx.body = await createTransaction(ctx, log)
        .then(resp => {
          ctx.status = resp.status
          return resp.text
        })
    })
    .post("/sendMessage", async ctx => {
      ctx.body = await uploadMessage(ctx, log)
        .then(res => {
          log.debug("uploadMessage", res.status)
          log.debug("uploadMessage", res.statusText)
          ctx.status = res.status
          return res.body
        })
    })
}


