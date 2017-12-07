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
        /* IP address or hostname (no scheme). */
        host : null,

        port : 4567,
        http_secure: false,
        ws_secure: false,

        /* Default ping interval in milliseconds. */
        ping_interval: 10000
    };

    /**
     * Contains information concerning access to resources like multimedia objects and thumbnails for preview.
     *
     * @type {{}}
     */
    private resources = {
        /** Path / URL to location where media object thumbnails will be stored. */
        host_thumbnails: "http://localhost/vitrivr",

        /** Path / URL to location where media object's will be stored. */
        host_object: "http://localhost/vitrivr",

        /** Default suffix for thumbnails. */
        suffix_default: ".jpg",

        /** Per-mediatype suffix definition for thumbnails. */
        suffix: {}
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
     * Configures the VBS (Video Browser Showdown) mode. Activating the VBS mode will make certain functionality
     * available in Vitrivr NG (like submitting videos).
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
        if (api) this.api = api;
        if (resources) this.resources = resources;
        if (evaluation) this.evaluation = evaluation;
        if (queryContainerTypes) this.queryContainerTypes = queryContainerTypes;
        if (vbs) this.vbs = vbs;
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
