#!/bin/bash

# Prepare mkdir command for each folder in public
DIRS_LIST=$(ls -R public | grep ":$" | sed -e "s/://g")
DIRS_CMD=$()
for i in $DIRS_LIST; do
  DIRS_CMD="$DIRS_CMD && mkdir -p $i"
done

# PROD Clean & deploy
ssh upsignon@upsignon.eu 'cd server '$DIRS_CMD
scp -r -p ./public upsignon@upsignon.eu:~/server

# BETA
ssh b-upsignon@beta.upsignon.eu 'cd server '$DIRS_CMD
scp -r -p ./public b-upsignon@beta.upsignon.eu:~/server

./scripts/deployPullMessages.sh
./scripts/deployUrlList.sh
