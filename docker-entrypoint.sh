#!/usr/bin/env sh
cd /app

export BABEL_DISABLE_CACHE=1
export NODE_ENV=production

node ./index.js
