const koa = require('koa');
const http = require('http');
const fs = require('fs');
const path = require('path');
const router = require('./router');
const app = require('./app');
const createLogger = require("./logger")
const config = {
  title: "Facer",
  env:   process.env.NODE_ENV || "production",
  ports: {
    http:  process.env.HTTP || 3666,
    https: process.env.HTTPS || 3443
  }
}
const logger = createLogger.create(config)
const log = logger.child({component: "server"})

app.listen(config.ports.http, err => {
  if (err) return logger("server", err)
  log.info(`==> Listening on http://0.0.0.0:${config.ports.http}/ 🚀 `.red)
})
