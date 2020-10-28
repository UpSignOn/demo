#!/bin/bash

yarn build

# PROD
# ---------------------
# Clean server
ssh upsignon@217.160.58.48 'cd server && rm -rf dist && mkdir -p migrations && mkdir -p dist && mkdir -p scripts'

# deploy code
scp -r -p ./migrations ./dist ./scripts ./package.json ./yarn.lock upsignon@217.160.58.48:~/server

# PROD RUN MIGRATIONS AND RESTART
ssh upsignon@217.160.58.48 'cd server && yarn install --production && pm2 reload ecosystem.prod-migrate.config.js --only migrate && pm2 reload ecosystem.prod.config.js --only server'



# BETA
# ---------------------
# Clean server
ssh b-upsignon@82.165.158.56 'cd server && rm -rf dist && mkdir -p migrations && mkdir -p dist && mkdir -p scripts'

# deploy code
scp -r -p ./migrations ./dist ./scripts ./package.json ./yarn.lock b-upsignon@82.165.158.56:~/server


# RUN MIGRATIONS AND RESTART
ssh b-upsignon@82.165.158.56 'cd server && yarn install --production && pm2 reload ecosystem.beta-migrate.config.js --only migrate && pm2 reload ecosystem.beta.config.js --only server'
