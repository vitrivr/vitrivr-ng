# Vitrivr NG
[![vitrivr - vitrivr-ng](https://img.shields.io/static/v1?label=vitrivr&message=vitrivr-ng&color=blue&logo=github)](https://github.com/vitrivr/vitrivr-ng)
[![GitHub release](https://img.shields.io/github/release/vitrivr/vitrivr-ng?include_prereleases=&sort=semver&color=2ea44f)](https://github.com/vitrivr/vitrivr-ng/releases/)
[![License](https://img.shields.io/badge/License-MIT-blueviolet)](#license)

This directory contains the source code distribution of Vitrivr NG (stands for either 'Angular' or 'Next Generation'). It was created using [Angular](https://angular.io/)

Vitrivr NG is a web-based user interface developed to be used with the latest version if [Cineast](https://github.com/vitrivr/cineast). It allows the user to browse in and retrieve from mixed multimedia collections.

For setup information, consult our [Wiki](https://github.com/vitrivr/vitrivr-ng/wiki)

## Config

There is a `config.json` which enables configuration of the UI to a certain extend.
While we provide a sensible [default config](src/config.json), the
some default values are better explored in the [code](src/app/shared/model/config/config.model.ts).

It's worth noting that there are customised variables for the API and resource hosts:

### API / Cineast:

The backend location can be specified as such:

```json
{
  "api": {
    "host": "$host", /* The host name of the API. Special value '$host', uses the serving host as API hostname (e.g. vitrivr-ng is served on example.com, example.com is used) */
    "port": 4567, /* The port of the API. */
    "http_secure": false, /* Whether or not TLS should be used for HTTP connection. */
    "ws_secure": false, /* Whether or not TLS should be used for WebSocket connection. */
    "ping_interval": 5000 /* Default ping interval in milliseconds. */
  }
}
```
All values are optional.

### Resources

The resources can be specified as such:

```json
{
  "resources": {
    "host_thumbnails": "http://somehost.com/thumbnails",
    /** Path / URL to location where media object thumbnails will be stored. */
    "host_objects": "http://somehost.com/objects",
    /** Path / URL to location where media object's will be stored. */
    "suffix_default": ".jpg",
    /** Default suffix for thumbnails. */
    "suffix": {
      /** Per-mediatype suffix definition for thumbnails. */
      "IMAGE": "png",
      "VIDEO": "png"
    },
    "port": "$host" /** Resources port */
  }
}
```

* `host_thumbnails`: Path / URL to location of the thumbnails. Defaults to the currently serving host.
* `host_objects`: Path / URL to location of the objects media files. Defaults to the currently serving host.
* `port`: Port of the resources. Defaults to the currently serving port, which is equivalent to `$host`. To use the port of the API, use `$api`. Otherwise a numeric port can be provided (as string, i.e. in quotes).

See [the wiki](https://github.com/vitrivr/vitrivr-ng/wiki/Configuration#resource-name-tokens) for further information on how to specify the thumbnails and objects resolution and which variables to use.

All values are optional.

## Development server

From the project folder, run `ng serve` to start a development server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
If you wish to prevent automatic reloading, run `ng serve --live-reload=false`

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## OpenAPI

### Cineast API

Note: this section is only relevant if you've made changes to the Cineast API and need to udpate the OpenAPI bindings. 

In order to update / generate the OpenApi stubs and data model, run the following command while [Cineast](https://github.com/vitrivr/cineast) is running and
having the OpenApi serving enabled (config option `"enableRestLiveDoc": "true"` )

`npm run gen-local-api`

This is an alias for the full-fledged command:

`openapi-generator-cli generate -g typescript-angular -i http://localhost:4567/openapi-specs -o openapi/cineast --skip-validate-spec --additional-properties npmName=@cineast-openapi/api,snapshot=true,ngVersion=13.0.0`

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
