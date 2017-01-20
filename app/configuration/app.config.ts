import {Injectable} from '@angular/core';

@Injectable()
export class Configuration {
    /** Config: API endpoint. Must end with a '/'. */
    private host = "localhost:4567";
    private path = "api";
    private version = "v1";
    private protocol_http = "http://";
    private protocol_ws ="ws://"

    /** BEGIN:  Publicly exposed configuration values. */

    public host_preview = "http://gasser-hauser.internet-box.ch/vitrivr"
    public host_object = "http://gasser-hauser.internet-box.ch/vitrivr/Video/"
    public endpoint_http = this.protocol_http + this.host + "/" + this.path + "/" + this.version + "/"
    public endpoint_ws = this.protocol_ws + this.host + "/" + this.path + "/" + this.version + "/"

    /* Ping interval in milliseconds. */
    public ping_interval = 10000;

    /** END:  Publicly exposed configuration values. */


}