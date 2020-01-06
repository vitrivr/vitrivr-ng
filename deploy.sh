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
npm install >> deploy.log 2>&1

if [ $? -ne 0 ]; then
    echo "Step 1 failed: Please check deploy.log" >&2
    exit 1
fi

# 
echo "Step 2: Building project..."
ng build --prod >> deploy.log 2>&1

if [ $? -ne 0 ]; then
    echo "Step 2 failed: Please check deploy.log" >&2
    exit 1
fi

if [ -f $deploy/config.json ]; then
    rm dist/config.json
fi

# Remove old files
echo "Step 3a: Clean-up old deployment..."
rm $deploy/3rdpartylicenses.txt >> deploy.log 2>&1
rm $deploy/MaterialIcons-Regular* >> deploy.log 2>&1
rm $deploy/favicon.ico >> deploy.log 2>&1
rm $deploy/index.html >> deploy.log 2>&1
rm $deploy/main.*.js >> deploy.log 2>&1
rm $deploy/polyfills.*.js >> deploy.log 2>&1
rm $deploy/runtime.*.js >> deploy.log 2>&1
rm $deploy/styles.*.css >> deploy.log 2>&1
rm $deploy/videogular.*.eot >> deploy.log 2>&1
rm $deploy/videogular.*.svg >> deploy.log 2>&1
rm -rf $deploy/assets >> deploy.log 2>&1

# Copy files
echo "Step 3b: Deploy..."
mv dist/* $deploy >> deploy.log 2>&1

if [ $? -ne 0 ]; then
    echo "Step 3 failed: Please check deploy.log" >&2
    exit 1
fi

# Optional: Adjust permissions
chown root:root $deploy >> deploy.log 2>&1
chown -R root:root $deploy/assets >> deploy.log 2>&1

echo "Successfully deployed Vitrivr NG to $deploy. Check deploy.log for more information."
