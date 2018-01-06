import {Tag} from "../selection/tag.model";

export class Config {
    /** Context of the Cineast API. */
    private static CONTEXT = "api";

    /** Version of the Cineast API. */
    private static VERSION = "v1";

    /**
     * Contains API specific configuration like hostname, port and protocols used for communication.
     *
     * @type {{host: string; port: number; http_secure: boolean; ws_secure: boolean; ping_interval: number}}
     */
    private _api = {
        host : window.location.hostname, /* IP address or hostname (no scheme), pointing to the API endpoint; defaults to hostname of window. */
        port : 4567, /* Port for the API. */
        http_secure: false, /* Whether or not TLS should be used for HTTP connection. */
        ws_secure: false, /* Whether or not TLS should be used for WebSocket connection. */
        ping_interval: 10000 /* Default ping interval in milliseconds. */
    };

    /**
     * Contains information concerning access to resources like multimedia objects and thumbnails for preview.
     *
     * @type {{}}
     */
    private _resources = {
        host_thumbnails: window.location.protocol + "//" + window.location.hostname + "/vitrivr/thumbnails",  /** Path / URL to location where media object thumbnails will be stored. */
        host_object: window.location.protocol + "//" + window.location.hostname + "/vitrivr/objects", /** Path / URL to location where media object's will be stored. */
        suffix_default: ".jpg", /** Default suffix for thumbnails. */
        suffix: {} /** Per-mediatype suffix definition for thumbnails. */
    };

    /**
     * Contains information concerning the configuration of the evaluation module.
     *
     * @type {{active: boolean; templates: string[]}}
     */
    private _evaluation = {
        active: true,
        templates: [] /* URLs */
    };

    /**
     * Configures the VBS (Video Browser Showdown) mode. Activating the VBS mode will make certain functionality available in
     * Vitrivr NG (like submitting videos).
     *
     * @type {{active: boolean; team: string; endpoint: string}}
     */
    private _vbs = {
        /* The team number within the VBS contest. */
        team: null,

        /* URL to the VBS endpoint. */
        endpoint: null
    };

    /** List of available tag. */
    private _tags: Tag[] = [
        new Tag("Red", 0),
        new Tag("Blue", 240),
        new Tag("Yellow", 60),
        new Tag("Magenta", 300),
    ];

    /**
     * Contains information regarding the available query-containers. Depending on this configuration, the user will be presented
     * with more or less options for querying.
     *
     * @type {{image: boolean; audio: boolean; model3d: boolean; motion: boolean; text: boolean}}
     */
    public queryContainerTypes = {
        image: true,
        audio: true,
        model3d: true,
        motion: true,
        text: true
    };

    /**
     * Default constructor for configuration object.
     *
     * @param api
     * @param resources
     * @param evaluation
     * @param queryContainerTypes
     * @param vbs
     */
    constructor(api?: any, resources?: any, evaluation?: any, queryContainerTypes?: any, vbs?: any, tags?: Tag[]) {
        if (api) Config.merge(this._api, api);
        if (resources) Config.merge(this._resources, resources);
        if (evaluation) Config.merge(this._evaluation, evaluation);
        if (queryContainerTypes) Config.merge(this.queryContainerTypes, queryContainerTypes);
        if (vbs) Config.merge(this._vbs, vbs);
        if (tags) this._tags = tags;
    }


    /**
     * Merges the loaded properties with the existing, default properties.
     *
     * @param defaultProperty The default property.
     * @param loadedProperty The loaded property.
     */
    public static merge(defaultProperty, loadedProperty) {
        for (let property in loadedProperty) {
            if (loadedProperty.hasOwnProperty(property) && defaultProperty.hasOwnProperty(property)) {
                defaultProperty[property] = loadedProperty[property];
            }
        }
    }

    /**
     * Getter for Path/URL to host of thumbnails
     *
     * @return {string}
     */
    get host_thumbnails(): string {
        return this._resources.host_thumbnails;
    }

    /**
     * Getter for Path/URL to host of multimedia-objects
     *
     * @return {string}
     */
    get host_object(): string {
        return this._resources.host_object;
    }

    /**
     * Returns URL to WebSocket endpoint for Vitrivr NG.
     *
     * @return {string}
     */
    get endpoint_ws(): string {
        let scheme = this._api.ws_secure ? "wss://" : "ws://";
        if (this._api.host && this._api.port) {
            return scheme + this._api.host + ":" + this._api.port + "/" + Config.CONTEXT + "/" + Config.VERSION + "/websocket";
        } else {
            return null;
        }
    }

    /**
     * Full URL to HTTP/RESTful endpoint for Vitrivr NG.
     *
     * @return {string}
     */
    get endpoint_http(): string {
        let scheme = this._api.ws_secure ? "https://" : "http://";
        if (this._api.host && this._api.port) {
            return scheme + this._api.host + ":" + this._api.port + "/" + Config.CONTEXT + "/" + Config.VERSION + "/";
        } else {
            return null;
        }
    }

    /**
     * Getter for PING interval (WebSocket & RestFul interface).
     *
     * @return {number}
     */
    get ping_interval(): number {
        return this._api.ping_interval;
    }

    /**
     * Getter for default suffix.
     *
     * @return {string}
     */
    get suffix_default(): string {
        return this._resources.suffix_default;
    }

    /**
     * Getter for per-mediatype suffix definition.
     *
     * @return {{}|any}
     */
    get suffix(): any {
        return this._resources.suffix;
    }

    /**
     * Returns true, if the evaluation modules is on and false otherwise.
     *
     * @return {boolean}
     */
    get evaluationOn(): boolean {
        return this._evaluation.active;
    }
    /**
     *
     * @return {Array}
     */
    get evaluationTemplates(): any {
        return this._evaluation.templates;
    }

    /**
     * Returns the URL to the VBS endpoint.
     *
     * @return {string}
     */
    get vbsTeam(): string {
        return this._vbs.team;
    }

    /**
     * Returns the URL to the VBS endpoint.
     *
     * @return {string}
     */
    get vbsEndpoint(): string {
        return this._vbs.endpoint;
    }

    /**
     * Returns the available Tags.
     *
     * @return {Tags[]}
     */
    get tags(): Tag[] {
        return this._tags;
    }
}
