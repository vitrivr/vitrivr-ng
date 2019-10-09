# Vitrivr NG

[![Build Status](https://travis-ci.org/vitrivr/vitrivr-ng.svg?branch=master)](https://travis-ci.org/vitrivr/vitrivr-ng)

This directory contains the source code distribution of Vitrivr NG (stands for either 'Angular' or 'Next Generation'). It was created using [Angular](https://angular.io/)

Vitrivr NG is a web-based user interface developed to be used with the latest version if [Cineast](https://github.com/vitrivr/cineast). It allows the user to browse in and retrieve from mixed multimedia collections.

## Setup environment
For development, you will require [NodeJS](https://nodejs.org) and the [npm](https://www.npmjs.com/) package manager. Both are easily installed using [nvm](https://github.com/nvm-sh/nvm)
The Vitrivr NG project was created with [Angular CLI](https://cli.angular.io) so you need to install that as well. Once *npm* is available on your machine, you can install *Angular CLI* globally using the following command in your console:

```bash
npm install -g @angular/cli
```

Then run
```bash
npm install
```

That's it. Now you should be ready to run Vitrivr NG!

## Configure
The configuration of Vitrivr NG can be made through the **src/config.json** file.
Most importantly, you have to adjust the `api.host` and `api.port` settings so that they point to a running instance of Cineast.
Furthermore, you have to adjust the URLs under `resources.host_thumbnails` and `resources.host_object`.
All references to thumbnails and media files will be resolved relative to those locations.

## Development server

From the project folder, run `ng serve` to start a development server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
If you wish to prevent automatic reloading, run `ng serve --live-reload=false`

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
