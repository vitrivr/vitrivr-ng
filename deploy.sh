#!/bin/bash

# Path to deployment folder (adjust)
deploy=$1
if [ -z ${1+x} ]; then
    echo "Error: Please specify a deployment directory."; >&2
    exit 1
fi

if [ ! -d $deploy ]; then
    echo "Error: Specified deployment directory '$deploy' does not exist." >&2
    exit 1
fi

# Begin...
echo "Deploying Vitrivr NG to $deploy. Did you update your project (GitHub)?"

# Building project
echo "Step 1: Updating dependencies..."
npm install &>> deploy.log

if [ $? -ne 0 ]; then
    echo "Step 1 failed: Please check deploy.log" >&2
    exit 1
fi

# 
echo "Step 2: Building project..."
ng build --prod &>> deploy.log

if [ $? -ne 0 ]; then
    echo "Step 2 failed: Please check deploy.log" >&2
    exit 1
fi

if [ -f $deploy/config.json ]; then
    rm dist/config.json
fi

# Remove old files
echo "Step 3a: Clean-up old deployment..."
rm $deploy/3rdpartylicenses.txt &>> deploy.log
rm $deploy/MaterialIcons-Regular* &>> deploy.log
rm $deploy/favicon.ico &>> deploy.log
rm $deploy/index.html &>> deploy.log
rm $deploy/main.*.js &>> deploy.log
rm $deploy/polyfills.*.js &>> deploy.log
rm $deploy/runtime.*.js &>> deploy.log
rm $deploy/styles.*.css &>> deploy.log
rm $deploy/videogular.*.eot &>> deploy.log
rm $deploy/videogular.*.svg &>> deploy.log
rm -rf $deploy/assets &>> deploy.log

# Copy files
echo "Step 3b: Deploy..."
mv dist/* $deploy &>> deploy.log

if [ $? -ne 0 ]; then
    echo "Step 3 failed: Please check deploy.log" >&2
    exit 1
fi

# Optional: Adjust permissions
chown root:root $deploy &>> deploy.log
chown -R root:root $deploy/assets &>> deploy.log

echo "Successfully deployed Vitrivr NG to $deploy. Check deploy.log for more information."
