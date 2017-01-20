"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var Configuration = (function () {
    function Configuration() {
        /** Config: API endpoint. Must end with a '/'. */
        this.host = "localhost:4567";
        this.path = "api";
        this.version = "v1";
        this.protocol_http = "http://";
        this.protocol_ws = "ws://";
        /** BEGIN:  Publicly exposed configuration values. */
        this.host_preview = "http://gasser-hauser.internet-box.ch/vitrivr";
        this.host_object = "http://gasser-hauser.internet-box.ch/vitrivr/Video/";
        this.endpoint_http = this.protocol_http + this.host + "/" + this.path + "/" + this.version + "/";
        this.endpoint_ws = this.protocol_ws + this.host + "/" + this.path + "/" + this.version + "/";
        /* Ping interval in milliseconds. */
        this.ping_interval = 10000;
    }
    Configuration = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], Configuration);
    return Configuration;
}());
exports.Configuration = Configuration;
//# sourceMappingURL=app.config.js.map