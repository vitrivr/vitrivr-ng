export class Config {
    /** Context of the Cineast API. */
    private static CONTEXT = "api";

    /** Version of the Cineast API. */
    private static VERSION = "v1";

    /**
     * Contains API specific configuration like hostname, port and protocols
     * used for communication.
     *
     * @type {{host: string; port: number}}
     */
    private api = {
        host : null,
        port : 4567,
        protocol_http: "http",
        protocol_ws: "ws",

        /* Default ping interval in milliseconds. */
        ping_interval: 10000
    };

    /**
     * Contains information concerning access to resources like multimedia objects
     * and thumbnails for preview.
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
     * @type {{}}
     */
    public evaluation = {
        active: true,
        templates: []
    };

    public queryContainerTypes = {
        image: true,
        audio: true,
        model3d: true,
        motion: true
    }

    /**
     * Default constructor for configuration object.
     *
     * @param api
     * @param resources
     * @param evaluation
     */
    constructor(api?: any, resources?: any, evaluation?: any, queryContainerTypes?: any) {
        if (api) this.api = api;
        if (resources) this.resources = resources;
        if (evaluation) this.evaluation = evaluation;
        if (queryContainerTypes) this.queryContainerTypes = queryContainerTypes;
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
        if (this.api.protocol_ws && this.api.host && this.api.port) {
            return this.api.protocol_ws + "://" + this.api.host + ":" + this.api.port + "/" + Config.CONTEXT + "/" + Config.VERSION + "/";
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
        if (this.api.protocol_http && this.api.host && this.api.port) {
            return this.api.protocol_http + "://" + this.api.host + ":" + this.api.port + "/" + Config.CONTEXT + "/" + Config.VERSION + "/";
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
     * Returns true, if the EvaluationModule is on and false otherwise.
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
}
