# Vitrivr NG

[![Build Status](https://travis-ci.org/vitrivr/vitrivr-ng.svg?branch=master)](https://travis-ci.org/vitrivr/vitrivr-ng)

This directory contains the source code distribution of Vitrivr NG (stands for either 'Angular' or 'Next Generation'). It was created using [Angular](https://angular.io/)

Vitrivr NG is a web-based user interface developed to be used with the latest version if [Cineast](https://github.com/vitrivr/cineast). It allows the user to browse in and retrieve from mixed multimedia collections.

For setup information, consult our [Wiki](https://github.com/vitrivr/vitrivr-ng/wiki)

## Development server

From the project folder, run `ng serve` to start a development server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
If you wish to prevent automatic reloading, run `ng serve --live-reload=false`

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## OpenAPI

### Cineast API

Note: this section is only relevant if you've made changes to the Cineast API and need to udpate the OpenAPI bindings. 

In order to update / generate the OpenApi stubs and data model, run the following command while [Cineast](https://github.com/vitrivr/cineast) is running and
having the OpenApi serving enabled (config option `"enableLiveDoc": "true"` )

`npm run gen-api`

This is an alias for the full-fledged command:

`openapi-generator generate -g typescript-angular -i http://localhost:4567/openapi-specs -o openapi/cineast --skip-validate-spec --additional-properties npmName=@cineast-openapi/api,snapshot=true,ngVersion=11.0.7`

The assumption for this snippet is, that the Cineast is running on localhost using port 4567. Adjust according to your needs.

This will break `ng serve` as it will generate imports for a `Set` class which does not exist. Simply remove all such imports which cause errors, the code will work fine.

### DRES Bindings

Since Vitrivr NG might be used in a competition context, we rely on
[DRES](https://github.com/dres-dev/DRES).

To update (and / or initially fetch) the DRES client library,
use this command:

`npm run gen-dres-client`

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Citation

We kindly ask you to refer to the following paper in publications mentioning or employing vitrivr NG:

Ralph Gasser, Luca Rossetto, Heiko Schuldt. _Multimodal multimedia retrieval with Vitrivr_. In Proceedings of the 2019 on International Conference on Multimedia Retrieval, pp. 391-394, Ottawa, Canada, 2019 - Download paper and BibTeX [here](https://dl.acm.org/doi/abs/10.1145/3323873.3326921)
