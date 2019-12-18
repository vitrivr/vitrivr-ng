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

    private _config = {
        api: {
            host: window.location.hostname, /* IP address or hostname (no scheme), pointing to the API endpoint; defaults to hostname of window. */
            port: 4567, /* Port for the API. */
            http_secure: false, /* Whether or not TLS should be used for HTTP connection. */
            ws_secure: false, /* Whether or not TLS should be used for WebSocket connection. */
            ping_interval: 10000 /* Default ping interval in milliseconds. */
        },
        resources: {
            host_thumbnails: window.location.protocol + '//' + window.location.hostname + '/vitrivr/thumbnails',
            /** Path / URL to location where media object thumbnails will be stored. */
            host_objects: window.location.protocol + '//' + window.location.hostname + '/vitrivr/objects',
            /** Path / URL to location where media object's will be stored. */
            suffix_default: '.jpg',
            /** Default suffix for thumbnails. */
            suffix: {} /** Per-mediatype suffix definition for thumbnails. */
        },
        evaluation: {
            active: true,
            templates: [] /* URLs */
        },
        vbs: {
            /* The team number within the VBS contest. */
            teamid: null,

            /* The tool number within the VBS context (each instance should have its own ID). */
            toolid: null,

            /* URL to the VBS endpoint. */
            endpoint: null,

            /*The timer interval at which logs are submitted to the VBS server. */
            loginterval: null,

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
            options: {
                image: true,
                audio: true,
                model3d: true,
                motion: true,
                text: true,
                tag: true,
                boolean: true
            },
            config: {
                queryId: null,
                hints: ['exact'],
                neighboringSegmentLookupCount: 10000,
                neighboringSegmentLookupAllCount: 240000
            },
            text: {
                categories: []
            },
            boolean: []
        },
        refinement: {
            filters: [
                ['dominantcolor.color', 'CHECKBOX'],
                ['technical.duration', 'SLIDER']
            ]
        }
    };

    /**
     * Default constructor for configuration object. The different configuration type can be passed to this constructor and the will be merged with
     * the default configuration.
     *
     * @param api Optional Cineast API configuration as, e.g. loaded from a file.
     * @param resources Optional resources configuration as, e.g. loaded from a file.
     * @param evaluation Optional evaluation configuration as, e.g. loaded from a file.
     * @param query Optional query configuration, e.g. loaded from a file.
     * @param vbs Optional VBS configuration as, e.g. loaded from a file.
     * @param tags Optional tag configurations as, e.g. loaded from a file.
     * @param mlt Optional More-Like-This categories as, e.g. loaded from a file.
     * @param refinement Optional refinement configuration
     */
    constructor(api?: any, resources?: any, evaluation?: any, query?: QuerySettings, vbs?: any, tags?: Tag[], mlt?: FeatureCategories[], refinement?: any) {
        const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;
        if (api) {
            this._config.api = DEEPMERGE(this._config.api, api, {arrayMerge: overwriteMerge});
        }
        if (resources) {
            this._config.resources = DEEPMERGE(this._config.resources, resources, {arrayMerge: overwriteMerge});
        }
        if (evaluation) {
            this._config.evaluation = DEEPMERGE(this._config.evaluation, evaluation, {arrayMerge: overwriteMerge});
        }
        if (query) {
            this._config.query = DEEPMERGE(this._config.query, query, {arrayMerge: overwriteMerge});
        }
        if (vbs) {
            this._config.vbs = DEEPMERGE(this._config.vbs, vbs, {arrayMerge: overwriteMerge});
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
     * Deserializes a Config object from a given JavaScript object or string.
     *
     * @param {{} | string} object The object that should be parsed.
     * @return {Config} The resulting config object.
     */
    public static deserialize(object: {} | string): Config {
        if (typeof object === 'string') object = JSON.parse(object);
        if (object['api'] || object['resources'] || object['evaluation'] || object['query'] || object['vbs'] || object['tags'] || object['mlt'] || object['refinement']) {
            return new Config(object['api'], object['resources'], object['evaluation'], object['query'], object['vbs'], object['tags'], object['mlt'], object['refinement']);
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
            const obj = components.reduce((obj, property) => {
                if (property === last) {
                    return obj
                } else {
                    return obj[property]
                }
            }, this._config);

            if (obj[last] && typeof value == typeof obj[last]) {
                obj[last] = value;
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    /**
     * Returns URL to WebSocket endpoint for Vitrivr NG.
     *
     * @return {string}
     */
    get endpoint_ws(): string {
        const scheme = this._config.api.ws_secure ? 'wss://' : 'ws://';
        if (this._config.api.host && this._config.api.port) {
            return scheme + this._config.api.host + ':' + this._config.api.port + '/' + Config.CONTEXT + '/' + Config.VERSION + '/websocket';
        } else {
            return null;
        }
    }

    /**
     * Full URL to HTTP/RESTful endpoint for Vitrivr NG.
     *
     * @return {string}
     *
     */
    get endpoint_http(): string {
        const scheme = this._config.api.ws_secure ? 'https://' : 'http://';
        if (this._config.api.host && this._config.api.port) {
            return scheme + this._config.api.host + ':' + this._config.api.port + '/' + Config.CONTEXT + '/' + Config.VERSION + '/';
        } else {
            return null;
        }
    }

    /**
     * Getter for Path/URL to host of thumbnails
     *
     * @return {string}
     * @deprecated
     */
    get host_thumbnails(): string {
        return this._config.resources.host_thumbnails;
    }

    /**
     * Getter for Path/URL to host of multimedia-objects
     *
     * @return {string}
     * @deprecated
     */
    get host_object(): string {
        return this._config.resources.host_objects;
    }

    /**
     * Getter for PING interval (WebSocket & RestFul interface).
     *
     * @return {number}
     * @deprecated
     */
    get ping_interval(): number {
        return this._config.api.ping_interval;
    }

    /**
     * Getter for default suffix.
     *
     * @return {string}
     * @deprecated
     */
    get suffix_default(): string {
        return this._config.resources.suffix_default;
    }

    /**
     * Getter for per-mediatype suffix definition.
     *
     * @return {{}|any}
     * @deprecated
     */
    get suffix(): any {
        return this._config.resources.suffix;
    }
}
