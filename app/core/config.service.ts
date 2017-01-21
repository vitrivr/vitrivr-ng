import {Injectable} from "@angular/core";

@Injectable()
export class ConfigService {
    private host = "localhost:4567";
    private path = "api";
    private version = "v1";
    private protocol_http = "http://";
    private protocol_ws ="ws://";

    /** BEGIN:  Publicly exposed configuration values. */

    public readonly host_preview = "http://gasser-hauser.internet-box.ch/vitrivr";
    public readonly host_object = "http://gasser-hauser.internet-box.ch/vitrivr/Video/";
    public readonly endpoint_http = this.protocol_http + this.host + "/" + this.path + "/" + this.version + "/";
    public readonly endpoint_ws = this.protocol_ws + this.host + "/" + this.path + "/" + this.version + "/";
    public readonly ping_interval = 10000; /* Ping interval in milliseconds. */

    /** END:  Publicly exposed configuration values. */
}