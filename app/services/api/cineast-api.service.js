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
var core_1 = require("@angular/core");
var app_config_1 = require("../../configuration/app.config");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var AbstractWebsocketService_1 = require("../../classes/communication/AbstractWebsocketService");
var CineastAPI = (function (_super) {
    __extends(CineastAPI, _super);
    /**
     * Default constructor.
     *
     * @param _configuration Gets injected by DI.
     */
    function CineastAPI(_configuration) {
        _super.call(this, _configuration.endpoint_ws, true);
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
        core_1.Injectable(), 
        __metadata('design:paramtypes', [app_config_1.Configuration])
    ], CineastAPI);
    return CineastAPI;
}(AbstractWebsocketService_1.AbstractWebsocketService));
exports.CineastAPI = CineastAPI;
//# sourceMappingURL=cineast-api.service.js.map