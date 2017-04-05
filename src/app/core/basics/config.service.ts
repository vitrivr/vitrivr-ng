import {Injectable} from "@angular/core";
import {Http} from "@angular/http";

@Injectable()
export class ConfigService {
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
        host : "localhost",
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
    };

    /**
     * Default constructor.
     *
     * @param _http
     */
    constructor(_http: Http) {
        let request = new XMLHttpRequest();
        request.open('GET', 'config.json', false);  // `false` makes the request synchronous
        request.send(null);
        if (request.status === 200) {
            let result = JSON.parse(request.responseText);
            /* Load API configuration. */
            if (result["api"]["host"]) this.api.host = result["api"]["host"];
            if (result["api"]["port"]) this.api.port = result["api"]["port"];
            if (result["api"]["protocol_http"]) this.api.protocol_http = result["api"]["protocol_http"];
            if (result["api"]["protocol_ws"]) this.api.protocol_ws = result["api"]["protocol_ws"];
            if (result["api"]["ping_interval"]) this.api.ping_interval = result["api"]["ping_interval"];

            /* Load resources configuration. */
            if (result["resources"]["host_thumbnails"]) this.resources.host_thumbnails = result["resources"]["host_thumbnails"];
            if (result["resources"]["host_object"]) this.resources.host_object = result["resources"]["host_object"];

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
        return this.api.protocol_ws + "://" + this.api.host + ":" + this.api.port + "/" + ConfigService.CONTEXT + "/" + ConfigService.VERSION + "/";
    }

    /**
     * Full URL to HTTP/RESTful endpoint for Vitrivr NG.
     *
     * @return {string}
     */
    get endpoint_http(): string {
        return this.api.protocol_http + "://" + this.api.host + ":" + this.api.port + "/" + ConfigService.CONTEXT + "/" + ConfigService.VERSION + "/";
    }

    /**
     * Getter for PING interval (WebSocket & RestFul interface).
     *
     * @return {number}
     */
    get ping_interval(): number {
        return this.api.ping_interval;
    }
}