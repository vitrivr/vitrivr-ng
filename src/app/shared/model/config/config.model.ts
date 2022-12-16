import {Tag} from '../../../core/selection/tag.model';
import {FeatureCategories} from '../results/feature-categories.model';
import {QuerySettings} from './query-settings.model';
import * as DEEPMERGE from 'deepmerge';
import {MetadataAccessSpecification} from '../messages/queries/metadata-access-specification.model';
import {MetadataType} from '../messages/queries/metadata-type.model';
import {InputType} from '../../../query/containers/bool/bool-attribute';

export class Config {
  /** Context of the Cineast API. */
  public static readonly CONTEXT = 'api';
  /** Version of the Cineast API. */
  public static readonly VERSION = 'v1';
  /** The key under which the main configuration will be saved. */
  public static readonly DB_KEY = 'main';
  /** Default display duration for Snackbar messages. */
  public static SNACKBAR_DURATION = 2500;
  /** A handy port checking regex based on https://stackoverflow.com/a/12968117 */
  private static readonly PORT_REGEX = /:([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])\//;
  _config = {
    title: 'vitrivr',
    api: {
      host: window.location.hostname, /* IP address or hostname (no scheme), pointing to the API endpoint; defaults to hostname of window. */
      port: 4567, /* Port for the API. */
      http_secure: false, /* Whether or not TLS should be used for HTTP connection. */
      ws_secure: false, /* Whether or not TLS should be used for WebSocket connection. */
      ping_interval: 5000 /* Default ping interval in milliseconds. */
    },
    resources: {
      /** Path / URL to location where media object thumbnails will be stored. */
      host_thumbnails: window.location.protocol + '//' + window.location.hostname + ':80/vitrivr/thumbnails',
      /** Path / URL to location where media object's will be stored. */
      host_objects: window.location.protocol + '//' + window.location.hostname + ':80/vitrivr/objects',
      /** Default suffix for thumbnails. */
      suffix_default: '.jpg',
      /** Per-mediatype suffix definition for thumbnails. */
      suffix: {
        'IMAGE': 'png',
        'VIDEO': 'png'
      },
      /** Options for the resources port: $host -> use the host's port, $api -> use the api port, number: specify the port */
      port: '$host' // string to enable overrides
    },
    competition: {
      /* Toggles VBS mode; determines type of information that is submitted. */
      vbs: false,

      /* Toggles LSC mode; determines type of information that is submitted. */
      lsc: false,

      /* Host of the DRES endpoint (fqn + port, no protocol). */
      host: "",

      /* Flag indicating whether or not TLS should be used to communicate with DRES. */
      tls: false,

      /* Flag indicating whether or not logging (interaction & results) should be enabled. */
      log: false,

      /* The timer interval at which logs are submitted to the competition server. */
      loginterval: 5000,

      /* URL to the Collabordinator endpoint. */
      collabordinator: null,

      /* if textual submissions should be enabled */
      textualInput: false
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
      'IMAGE': ['visualtextcoembedding'],
      'VIDEO': ['visualtextcoembedding'],
      'AUDIO': ['audiofingerprint'],
      'IMAGE_SEQUENCE': ['visualtextcoembedding']
    },
    query: {
      history: -1,
      scoreFunction: 'average', // the scoring function to use in SEGMENT and OBJECT view
      temporalView: true, // Activate or deactivate temporal scoring (view) at all
      options: {
        image: true,
        audio: false,
        model3d: false,
        text: true,
        tag: false,
        map: false,
        semantic: true,
        boolean: true,
        skeleton: false
      },
      metadata: {
        object: [
          ['*', '*']
        ],
        segment: [
          ['*', '*']
        ]
      },
      config: {
        queryId: null,
        neighboringSegmentLookupCount: 5,
        neighboringSegmentLookupAllCount: 200000
      },
      text: {
        categories: [['visualtextcoembedding', 'Text Co-Embedding']]
      },
      boolean: [
        {
          display: "Segment Id",
          input: InputType.TEXT,
          table: "cineast_segment",
          col: "segmentid",
          operators: [
            "="
          ]
        },
        {
          display: "Object Id",
          input: InputType.TEXT,
          table: "cineast_segment",
          col: "objectid",
          operators: [
            "="
          ]
        }
      ],
      temporal_mode: 'TEMPORAL_DISTANCE',
      enableTagPrioritisation: false,
      temporal_max_length: 600,
      default_temporal_distance: 10
    },
    refinement: {
      filters: [
        ['dominantcolor.color', 'CHECKBOX'],
        ['technical.duration', 'SLIDER']
      ],
      showMetadataInViewer: false
    }
  };

  /**
   * Default constructor for configuration object. The different configuration type can be passed to this constructor and the will be merged with
   * the default configuration.
   *
   * @param title Optional title for the application as, e.g. loaded from a file.
   * @param api Optional Cineast API configuration as, e.g. loaded from a file.
   * @param resources Optional resources configuration as, e.g. loaded from a file.
   * @param query Optional query configuration, e.g. loaded from a file.
   * @param competition Optional competition configuration as, e.g. loaded from a file.
   * @param tags Optional tag configurations as, e.g. loaded from a file.
   * @param mlt Optional More-Like-This categories as, e.g. loaded from a file.
   * @param refinement Optional refinement configuration
   */
  constructor(title?: string, api?: any, resources?: any, query?: QuerySettings, competition?: any, tags?: Tag[], mlt?: FeatureCategories[], refinement?: any) {
    const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;
    if (title) {
      this._config.title = title;
    }
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
    if (this._config.api.host === '$host') {
      this._config.api.host = window.location.hostname
    }
    this._config.resources.host_objects = this._config.resources.host_objects.replace('/$host/', '/' + window.location.hostname + '/');
    this._config.resources.host_thumbnails = this._config.resources.host_thumbnails.replace('/$host/', '/' + window.location.hostname + '/');
    if (this._config.resources.port) {
      const providedPort = this._config.resources.port;
      let port = window.location.port;
      if (providedPort === '$api') {
        port = '' + this._config.api.port;
      } else if (providedPort.match(Config.PORT_REGEX)?.length > 0) {
        port = '' + providedPort;
      } else if (providedPort === '$host') {
        // default
      } // no else, as this was the default.
      this._config.resources.host_objects = this._config.resources.host_objects.replace(Config.PORT_REGEX, ':' + port + '/');
      this._config.resources.host_thumbnails = this._config.resources.host_thumbnails.replace(Config.PORT_REGEX, ':' + port + '/');
    }
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

  get metadataAccessSpec(): MetadataAccessSpecification[] {
    let spec: MetadataAccessSpecification[] = []
    this._config.query.metadata.object.forEach(el => spec.push(new MetadataAccessSpecification(MetadataType.OBJECT, el[0], el[1])))
    this._config.query.metadata.segment.forEach(el => spec.push(new MetadataAccessSpecification(MetadataType.SEGMENT, el[0], el[1])))
    return spec;
  }

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
      return new Config(object['title'], object['api'], object['resources'], object['query'], object['competition'], object['tags'], object['mlt'], object['refinement']);
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
