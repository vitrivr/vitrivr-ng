#!/bin/bash

# Path to deployment folder (adjust)
deploy=$1
if [ -z ${1+x} ]; then
    echo "Error: Please specify a deployment directory.";
    exit 1
fi

if [ ! -d $deploy ]; then
    echo "Error: Specified deployment directory '$deploy' does not exist."
    exit 1
fi

# Begin...
echo "Deploying Vitrivr NG to $deploy..."

# Update project and build
echo "Step 1: Updating build..."
git pull
npm install
ng build --prod

if [ -f $deploy/config.json ]; then
    rm dist/config.json
fi

# Remove old files
echo "Step 2: Clean-up old deployment..."
rm $deploy/3rdpartylicenses.txt
rm $deploy/MaterialIcons-Regular*
rm $deploy/favicon.ico
rm $deploy/index.html
rm $deploy/main.*.js
rm $deploy/polyfills.*.js
rm $deploy/runtime.*.js
rm $deploy/styles.*.css
rm $deploy/videogular.*.eot
rm $deploy/videogular.*.svg
rm -rf $deploy/assets

# Copy files
echo "Step 3: Deploy..."
mv dist/* $deploy

# Optional: Adjust permissions
chown root:root $deploy
chown -R root:root $deploy/assets

echo "Successfully deployed Vitrivr NG to $deploy."
