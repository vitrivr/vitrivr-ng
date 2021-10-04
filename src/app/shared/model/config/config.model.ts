import {Tag} from '../../../core/selection/tag.model';
import {FeatureCategories} from '../results/feature-categories.model';
import {QuerySettings} from './query-settings.model';
import * as DEEPMERGE from 'deepmerge';

export class Config {
  /** Context of the Cineast API. */
  public static readonly CONTEXT = 'api';

  /** Version of the Cineast API. */
  public static readonly VERSION = 'v1';

  /** The key under which the main configuration will be saved. */
  public static readonly DB_KEY = 'main';

  /** Default display duration for Snackbar messages. */
  public static SNACKBAR_DURATION = 2500;

  public maxLength = 600;

  _config = {
    api: {
      host: window.location.hostname, /* IP address or hostname (no scheme), pointing to the API endpoint; defaults to hostname of window. */
      port: 4567, /* Port for the API. */
      http_secure: false, /* Whether or not TLS should be used for HTTP connection. */
      ws_secure: false, /* Whether or not TLS should be used for WebSocket connection. */
      ping_interval: 5000 /* Default ping interval in milliseconds. */
    },
    resources: {
      host_thumbnails: window.location.protocol + '//' + window.location.hostname + '/vitrivr/thumbnails',
      /** Path / URL to location where media object thumbnails will be stored. */
      host_objects: window.location.protocol + '//' + window.location.hostname + '/vitrivr/objects',
      /** Path / URL to location where media object's will be stored. */
      suffix_default: '.jpg',
      /** Default suffix for thumbnails. */
      suffix: {
        'IMAGE': 'png',
        'VIDEO': 'png'
      } /** Per-mediatype suffix definition for thumbnails. */
    },
    competition: {
      /* Toggles VBS mode; determines type of information that is submitted. */
      vbs: false,

      /* Toggles LSC mode; determines type of information that is submitted. */
      lsc: false,

      /* Host of the DRES endpoint (fqn + port, no protocol). */
      host: null,

      /* Flag indicating whether or not TLS should be used to communicate with DRES. */
      tls: false,

      /* Flag indicating whether or not logging (interaction & results) should be enabled. */
      log: false,

      /* The timer interval at which logs are submitted to the competition server. */
      loginterval: 5000,

      /* URL to the Collabordinator endpoint. */
      collabordinator: null
    },
    tags: [
      new Tag('Red', 0),
      new Tag('Orange', 30),
      new Tag('Blue', 240),
      new Tag('Violet', 270),
      new Tag('Magenta', 300),
    ],
    mlt: {
      'MODEL3D': ['sphericalharmonicsdefault'],
      'IMAGE': ['globalcolor', 'localcolor', 'edge', 'localfeatures'],
      'VIDEO': ['globalcolor', 'localcolor', 'edge', 'localfeatures'],
      'AUDIO': ['audiofingerprint'],
      'IMAGE_SEQUENCE': ['globalcolor', 'localcolor', 'edge']
    },
    query: {
      history: -1,
      scoreFunction: 'average', // the scoring function to use in SEGMENT and OBJECT view
      temporalView: true, // Activate or deactivate temporal scoring (view) at all
      options: {
        image: true,
        audio: false,
        model3d: true,
        motion: false,
        text: false,
        tag: true,
        semantic: false,
        boolean: true
      },
      config: {
        queryId: null,
        hints: ['exact'],
        neighboringSegmentLookupCount: 5,
        neighboringSegmentLookupAllCount: 200000
      },
      text: {
        categories: []
      },
      boolean: [],
      temporal_mode: 'TEMPORAL_DISTANCE'
    },
    refinement: {
      filters: [
        ['dominantcolor.color', 'CHECKBOX'],
        ['technical.duration', 'SLIDER']
      ]
    }
  };

  /**
   * Deserializes a Config object from a given JavaScript object or string.
   *
   * @param {{} | string} object The object that should be parsed.
   * @return {Config} The resulting config object.
   */
  public static deserialize(object: {} | string): Config {
    if (typeof object === 'string') {
      object = JSON.parse(object);
    }
    if (object['api'] || object['resources'] || object['query'] || object['competition'] || object['tags'] || object['mlt'] || object['refinement']) {
      return new Config(object['api'], object['resources'], object['query'], object['competition'], object['tags'], object['mlt'], object['refinement']);
    } else {
      return null;
    }
  }

  /**
   * Default constructor for configuration object. The different configuration type can be passed to this constructor and the will be merged with
   * the default configuration.
   *
   * @param api Optional Cineast API configuration as, e.g. loaded from a file.
   * @param resources Optional resources configuration as, e.g. loaded from a file.
   * @param query Optional query configuration, e.g. loaded from a file.
   * @param competition Optional competition configuration as, e.g. loaded from a file.
   * @param tags Optional tag configurations as, e.g. loaded from a file.
   * @param mlt Optional More-Like-This categories as, e.g. loaded from a file.
   * @param refinement Optional refinement configuration
   */
  constructor(api?: any, resources?: any, query?: QuerySettings, competition?: any, tags?: Tag[], mlt?: FeatureCategories[], refinement?: any) {
    const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;
    if (api) {
      this._config.api = DEEPMERGE(this._config.api, api, {arrayMerge: overwriteMerge});
    }
    if (resources) {
      this._config.resources = DEEPMERGE(this._config.resources, resources, {arrayMerge: overwriteMerge});
    }
    if (query) {
      this._config.query = DEEPMERGE(this._config.query, query, {arrayMerge: overwriteMerge});
    }
    if (competition) {
      this._config.competition = DEEPMERGE(this._config.competition, competition, {arrayMerge: overwriteMerge});
    }
    if (tags) {
      this._config.tags = DEEPMERGE(this._config.tags, tags, {arrayMerge: overwriteMerge});
    }
    if (mlt) {
      this._config.mlt = DEEPMERGE(this._config.mlt, mlt, {arrayMerge: overwriteMerge});
    }
    if (refinement) {
      this._config.refinement = DEEPMERGE(this._config.refinement, refinement, {arrayMerge: overwriteMerge});
    }
    if (this._config.api.host === 'default') {
      this._config.api.host = window.location.hostname
    }
    this._config.resources.host_objects = this._config.resources.host_objects.replace('/default/', '/' + window.location.hostname + '/');
    this._config.resources.host_thumbnails = this._config.resources.host_thumbnails.replace('/default/', '/' + window.location.hostname + '/');
  }

  /**
   * Returns URL to WebSocket endpoint for Vitrivr NG.
   */
  get cineastEndpointWs(): string {
    const scheme = this._config.api.ws_secure ? 'wss://' : 'ws://';
    if (this._config.api.host && this._config.api.port) {
      return scheme + this._config.api.host + ':' + this._config.api.port + '/' + Config.CONTEXT + '/' + Config.VERSION + '/websocket';
    } else {
      return null;
    }
  }

  /**
   * Based on the config, this returns the REST API endpoint.
   * Fully qualified with the schema (if secured, this is HTTPS, otherwise HTTP)
   * the host and the port.
   */
  get cineastEndpointRest(): string {
    const scheme = this._config.api.http_secure ? 'https://' : 'http://';
    if (this._config.api.host && this._config.api.port) {
      return scheme + this._config.api.host + ':' + this._config.api.port;
    } else {
      return null;
    }
  }

  /**
   * Full URL to HTTP/HTTPs RESTful endpoint for DRES.
   */
  get dresEndpointRest() {
    const scheme = this._config.competition.tls ? 'https://' : 'http://';
    if (this._config.competition.host) {
      return `${scheme}${this._config.competition.host}`
    } else {
      return null;
    }
  }

  /**
   * Accesses and returns the config value specified by the given path. Path components are separated by a '.'
   * If the value does not exist, then null is returned!
   *
   * @param {string} path Path relative to this._config; components separated by '.'
   * @return {T | null} The config value at the given path or null.
   */
  public get<T>(path: string): T {
    try {
      const separator = '.';
      const components = path.replace('[', separator).replace(']', '').split(separator);
      return components.reduce((obj, property) => obj[property], this._config);
    } catch (err) {
      return null;
    }
  }

  /**
   * Replaces the config value specified by the given path by the value provided. Path components are separated by a '.'
   *
   * @param {string} path Path relative to this._config; components separated by '.'
   * @param {T} value New value
   * @return true on success, false if the path does not exist.
   */
  public set<T>(path: string, value: T): boolean {
    try {
      const separator = '.';
      const components = path.replace('[', separator).replace(']', '').split(separator);
      const last = components[components.length - 1];
      const obj = components.reduce((_obj, property) => {
        if (property === last) {
          return _obj
        } else {
          return _obj[property]
        }
      }, this._config);

      if (obj[last] && typeof value === typeof obj[last]) {
        obj[last] = value;
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  }
}
