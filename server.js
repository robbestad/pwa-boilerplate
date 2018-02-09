const koa = require('koa');
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('./app');
const config = require("./config")
const colors = require("colors")

app.listen(config.ports.http, err => {
  if (err) console.log({err})
  console.log(`==> Listening on http://0.0.0.0:${config.ports.http}/ 🚀 `.red)
})
