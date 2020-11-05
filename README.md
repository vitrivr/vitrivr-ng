# Vitrivr NG

[![Build Status](https://travis-ci.org/vitrivr/vitrivr-ng.svg?branch=master)](https://travis-ci.org/vitrivr/vitrivr-ng)

This directory contains the source code distribution of Vitrivr NG (stands for either 'Angular' or 'Next Generation'). It was created using [Angular](https://angular.io/)

Vitrivr NG is a web-based user interface developed to be used with the latest version if [Cineast](https://github.com/vitrivr/cineast). It allows the user to browse in and retrieve from mixed multimedia collections.

For setup information, consult our [Wiki](https://github.com/vitrivr/vitrivr-ng/wiki)

## OpenAPI

This project requires openapi services to allow communication with Cineast. Make sure the API docs have been exported from Cineast beforehand (with `./gradlew generateOpenApiSpecs`) and that the path to Cineast is adjusted in the following command to match your local directory structure. Then, please start the generator from your root Vitrivr NG folder.

`npx @openapitools/openapi-generator-cli generate -i ../cineast/docs/openapi.json -g typescript-angular -o src/app/core/openapi`


## Development server

From the project folder, run `ng serve` to start a development server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
If you wish to prevent automatic reloading, run `ng serve --live-reload=false`

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Citation

We kindly ask you to refer to the following paper in publications mentioning or employing vitrivr NG:

Ralph Gasser, Luca Rossetto, Heiko Schuldt. _Multimodal multimedia retrieval with Vitrivr_. In Proceedings of the 2019 on International Conference on Multimedia Retrieval, pp. 391-394, Ottawa, Canada, 2019 - Download paper and BibTeX [here](https://dl.acm.org/doi/abs/10.1145/3323873.3326921)
