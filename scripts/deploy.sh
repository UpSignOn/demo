#!/bin/bash

yarn build

# Clean demo
ssh b-upsignon@beta.upsignon.eu 'cd demo && rm -rf dist && mkdir -p dist && mkdir -p public-monptitshop && mkdir -p public-raoul'

# deploy code
scp -r -p ./migrations ./dist ./package.json ./yarn.lock b-upsignon@beta.upsignon.eu:~/demo
scp -p ./public/monptitshop.html b-upsignon@beta.upsignon.eu:~/demo/public-monptitshop/index.html
scp -p ./public/raoul.html b-upsignon@beta.upsignon.eu:~/demo/public-raoul/index.html

# RESTART
ssh b-upsignon@beta.upsignon.eu 'cd demo && yarn install --production && pm2 reload ecosystem.demo.config.js'

# DO NOT FORGET TO PLAY PROVISION.md the first time
