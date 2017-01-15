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
var app_config_1 = require("../configuration/app.config");
var core_1 = require("@angular/core");
var Rx_1 = require('rxjs/Rx');
var AbstractWebsocketService = (function () {
    /**
     *
     * @param _configuration
     * @param path
     */
    function AbstractWebsocketService(_configuration, path) {
        var _this = this;
        this._configuration = _configuration;
        /* WebSocket used by the AbstractWebsocketService implementation. */
        this._socket = null;
        /* Indication of the connection status. */
        this.connection = "DISCONNECTED";
        /**
         * The Observable for the service that everyone can subscribe to. The service uses this observable
         * to notify the subscribers about changes.
         */
        this.observable = Rx_1.Observable.create(function (observer) {
            _this.onServiceClose = observer.complete.bind(observer);
            _this.onServiceError = observer.error.bind(observer);
            _this.onServiceNext = observer.next.bind(observer);
        });
        this._url = this.url(path);
        this.createSocket();
    }
    /**
     *
     * @returns {any}
     */
    AbstractWebsocketService.prototype.createSocket = function () {
        var _this = this;
        /* Create Socket: Once connection was established, change status to 'WAITING'. */
        var socket = new WebSocket(this._url);
        socket.onopen = function () { this.connection = "WAITING"; }.bind(this);
        var observable = Rx_1.Observable.create(function (observer) {
            socket.onmessage = observer.next.bind(observer);
            socket.onerror = observer.error.bind(observer);
            socket.onclose = observer.complete.bind(observer);
            return socket.close.bind(socket);
        });
        var observer = {
            next: function (data) {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(data);
                }
            },
        };
        this._socket = Rx_1.Subject.create(observer, observable);
        this._socket.subscribe(function (message) {
            _this.onSocketMessage(message.data);
        }, function (error) {
            _this.onSocketError(error);
        }, function () {
            _this.onSocketClose();
        });
        /* Log the successful connection of the socket. */
        console.log("Socket connected to: " + this._url);
    };
    /**
     *
     * @param path
     * @returns {string}
     */
    AbstractWebsocketService.prototype.url = function (path) {
        return this._configuration.endpoint_ws + path;
    };
    /**
     *
     * @param object
     */
    AbstractWebsocketService.prototype.send = function (object) {
        if (this.connection == "WAITING") {
            this._socket.next(JSON.stringify(object));
            return true;
        }
        else {
            return false;
        }
    };
    /**
     *
     * @param str
     */
    AbstractWebsocketService.prototype.sendstr = function (str) {
        this._socket.next(str);
    };
    /**
     *
     * @param message
     */
    AbstractWebsocketService.prototype.onSocketError = function (error) {
        console.log("Error occurred with socket to '" + this._url + "':" + error);
        this.connection = "ERROR";
        this._socket.unsubscribe();
        this._socket = null;
        if (this.onServiceError != undefined)
            this.onServiceError(error);
    };
    ;
    /**
     *
     * @param message
     */
    AbstractWebsocketService.prototype.onSocketClose = function () {
        console.log("Socket to '" + this._url + "' was closed.");
        this.connection = "DISCONNECTED";
        this._socket.unsubscribe();
        this._socket = null;
        if (this.onServiceClose != undefined)
            this.onServiceClose();
    };
    AbstractWebsocketService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [app_config_1.Configuration, String])
    ], AbstractWebsocketService);
    return AbstractWebsocketService;
}());
exports.AbstractWebsocketService = AbstractWebsocketService;
//# sourceMappingURL=websocket.interface.js.map