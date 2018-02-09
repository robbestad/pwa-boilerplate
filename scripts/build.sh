#!/bin/bash
#SCRIPTS="`dirname \"$0\"`"
cd src && webpack -p
cd .. && npm run release
docker build -t svena/facer-v2 .
docker push svena/facer-v2
