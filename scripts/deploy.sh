#!/bin/bash

yarn build

# Clean demo
ssh b-upsignon@beta.upsignon.eu 'cd demo && rm -rf dist && mkdir -p dist && mkdir -p public'

# deploy code
scp -r -p ./migrations ./dist ./package.json ./yarn.lock ./public b-upsignon@beta.upsignon.eu:~/demo

# RESTART
ssh b-upsignon@beta.upsignon.eu 'cd demo && yarn install --production && pm2 reload ecosystem.demo.config.js --only demo'

# DO NOT FORGET TO PLAY PROVISION.md the first time
