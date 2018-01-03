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
    private api = {
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
    private resources = {
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
    private evaluation = {
        active: true,
        templates: [] /* URLs */
    };

    /**
     * Configures the VBS (Video Browser Showdown) mode. Activating the VBS mode will make certain functionality available in
     * Vitrivr NG (like submitting videos).
     *
     * @type {{active: boolean; endpoint: string}}
     */
    private vbs = {
        /* Flag indicating whether VBS mode should be active or not. */
        active: false,

        /* The team number within the VBS contest. */
        team: -1,

        /* URL to the VBS endpoint. */
        endpoint: null
    };

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
    constructor(api?: any, resources?: any, evaluation?: any, queryContainerTypes?: any, vbs?: any) {
        if (api) Config.merge(this.api, api);
        if (resources) Config.merge(this.resources, resources);
        if (evaluation) Config.merge(this.evaluation, evaluation);
        if (queryContainerTypes) Config.merge(this.queryContainerTypes, queryContainerTypes);
        if (vbs) Config.merge(this.vbs, vbs);
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
        return this.resources.host_thumbnails;
    }

    /**
     * Getter for Path/URL to host of multimedia-objects
     *
     * @return {string}
     */
    get host_object(): string {
        return this.resources.host_object;
    }

    /**
     * Returns URL to WebSocket endpoint for Vitrivr NG.
     *
     * @return {string}
     */
    get endpoint_ws(): string {
        let scheme = this.api.ws_secure ? "wss://" : "ws://";
        if (this.api.host && this.api.port) {
            return scheme + this.api.host + ":" + this.api.port + "/" + Config.CONTEXT + "/" + Config.VERSION + "/websocket";
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
        let scheme = this.api.ws_secure ? "https://" : "http://";
        if (this.api.host && this.api.port) {
            return scheme + this.api.host + ":" + this.api.port + "/" + Config.CONTEXT + "/" + Config.VERSION + "/";
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
        return this.api.ping_interval;
    }

    /**
     * Getter for default suffix.
     *
     * @return {string}
     */
    get suffix_default(): string {
        return this.resources.suffix_default;
    }

    /**
     * Getter for per-mediatype suffix definition.
     *
     * @return {{}|any}
     */
    get suffix(): any {
        return this.resources.suffix;
    }

    /**
     * Returns true, if the evaluation modules is on and false otherwise.
     *
     * @return {boolean}
     */
    get evaluationOn(): boolean {
        return this.evaluation.active;
    }
    /**
     *
     * @return {Array}
     */
    get evaluationTemplates(): any {
        return this.evaluation.templates;
    }

    /**
     * Returns true, if the VBS mode is on and false otherwise.
     *
     * @return {boolean}
     */
    get vbsOn(): boolean {
        return this.vbs.active;
    }

    /**
     * Returns the URL to the VBS endpoint.
     *
     * @return {string}
     */
    get vbsTeam(): number {
        return this.vbs.team;
    }

    /**
     * Returns the URL to the VBS endpoint.
     *
     * @return {string}
     */
    get vbsEndpoint(): string {
        return this.vbs.endpoint;
    }
}
