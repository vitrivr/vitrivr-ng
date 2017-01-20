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
var Rx_1 = require('rxjs/Rx');
var cineast_api_service_1 = require("../../services/api/cineast-api.service");
var app_config_1 = require("../../configuration/app.config");
var PingComponent = (function () {
    /**
     * Default constructor. Subscribe for PING messages at the CineastAPI.
     *
     * @param _api
     * @param _config
     */
    function PingComponent(_api, _config) {
        var _this = this;
        this._api = _api;
        this._config = _config;
        this._apistatus = "DISCONNECTED";
        _api.observable()
            .filter(function (msg) { return ["PING"].indexOf(msg[0]) > -1; })
            .subscribe(function (msg) { return _this.onMessage(msg[1]); });
    }
    /**
     * Schedules a timer that pings the API every 10 seconds.
     */
    PingComponent.prototype.ngOnInit = function () {
        var _this = this;
        var timer = Rx_1.Observable.timer(0, this._config.ping_interval);
        timer.subscribe(function (t) {
            _this.last = Date.now();
            _this._api.send({ messagetype: 'PING' });
        });
    };
    /**
     * Processes a response message and changes the
     * icon accordingly.
     *
     * @param msg
     */
    PingComponent.prototype.onMessage = function (msg) {
        this._apistatus = JSON.parse(msg).status;
        this.latency = (Date.now() - this.last);
    };
    /**
     * Returns the icon name based on the current API status.
     * @returns {any}
     */
    PingComponent.prototype.icon = function () {
        switch (this._apistatus) {
            case 'DISCONNECTED':
                return 'flash_off';
            case 'ERROR':
                return 'error';
            case 'OK':
                return 'check_circle';
            default:
                return 'watch_later';
        }
    };
    PingComponent = __decorate([
        core_1.Component({
            selector: 'api-status',
            template: "\n        <span >\n            API Status:&nbsp;<md-icon style=\"vertical-align:text-bottom;\">{{icon()}}</md-icon>&nbsp;{{latency ? '(' + latency + 'ms)' : ''}}\n        </span>\n    "
        }), 
        __metadata('design:paramtypes', [cineast_api_service_1.CineastAPI, app_config_1.Configuration])
    ], PingComponent);
    return PingComponent;
}());
exports.PingComponent = PingComponent;
//# sourceMappingURL=ping.component.js.map