import {Injectable} from "@angular/core";

@Injectable()
export class ConfigService {
    private host = "localhost:4567";
    private path = "api";
    private version = "v1";
    private protocol_http = "http://";
    private protocol_ws ="ws://";

    /** BEGIN:  Publicly exposed configuration values. */

    /** Path / URL to location where media object thumbnails will be stored. */
    public readonly host_thumbnails = "http://gasser-hauser.internet-box.ch/vitrivr/thumbnails/";

    /** Path / URL to location where media object's will be stored. */
    public readonly host_object = "http://gasser-hauser.internet-box.ch/vitrivr/";

    /** Full URL to HTTP/RESTful endpoint for Vitrivr NG (IMPORTANT: Don't forget trailing /). */
    public readonly endpoint_http = this.protocol_http + this.host + "/" + this.path + "/" + this.version + "/";

    /** Full URL to WebSocket endpoint for Vitrivr NG (IMPORTANT: Don't forget trailing /). */
    public readonly endpoint_ws = this.protocol_ws + this.host + "/" + this.path + "/" + this.version + "/";

    /* Default ping interval in milliseconds. */
    public readonly ping_interval = 10000;

    /** END:  Publicly exposed configuration values. */
}