#!/bin/bash
#SCRIPTS="`dirname \"$0\"`"
cd src && webpack -p
cd .. && npm run release
PKG_VERSION=`node -p "require('./package.json').version"`
docker build -t svena/facer-v2:$PKG_VERSION .
docker push svena/facer-v2:$PKG_VERSION
echo "\nPUSHED svena/facer-v2:${PKG_VERSION}\n"

