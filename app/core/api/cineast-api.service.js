"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var abstract_websocket_service_1 = require("./abstract-websocket.service");
var config_service_1 = require("../config.service");
var core_1 = require("@angular/core");
var CineastAPI = (function (_super) {
    __extends(CineastAPI, _super);
    /**
     * Default constructor.
     */
    function CineastAPI(_config) {
        _super.call(this, _config.endpoint_ws, true);
        var init = ["INIT", JSON.stringify({ messagetype: 'INIT' })];
        this.messages = new BehaviorSubject_1.BehaviorSubject(init);
        console.log("Cineast API Service is up and running!");
    }
    /**
     * This method can be used by the caller to get an Observer for messages received by the local
     * Cineast API endpoint. It is up to the describer to subscribe to the Observer.
     *
     * Note: Use Observer.filter() to filter for message-types
     *
     * @returns {Observable<[MessageType, string]>}
     */
    CineastAPI.prototype.observable = function () {
        return this.messages.asObservable();
    };
    /**
     * This is where the magic happens: Subscribes to messages from the underlying WebSocket and orchestrates the
     * assembly of the individual pieces of QueryResults.
     *
     * @param message
     */
    CineastAPI.prototype.onSocketMessage = function (message) {
        var msg = JSON.parse(message);
        if (msg.messagetype != undefined) {
            var pair = [msg.messagetype, message];
            this.messages.next(pair);
        }
    };
    CineastAPI = __decorate([
        __param(0, core_1.Inject(config_service_1.ConfigService)), 
        __metadata('design:paramtypes', [config_service_1.ConfigService])
    ], CineastAPI);
    return CineastAPI;
}(abstract_websocket_service_1.AbstractWebsocketService));
exports.CineastAPI = CineastAPI;
//# sourceMappingURL=cineast-api.service.js.map