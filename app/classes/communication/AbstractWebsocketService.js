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
var core_1 = require("@angular/core");
var Rx_1 = require('rxjs/Rx');
var AbstractWebsocketService = (function () {
    /**
     * Default constructor.
     *
     * @param _url The endpoint to which a WebSocket connection should be established.
     * @param reestablish If true, the socket will try to re-establish connection after an error or a close.
     */
    function AbstractWebsocketService(_url, reestablish) {
        if (reestablish === void 0) { reestablish = true; }
        this._url = _url;
        this.reestablish = reestablish;
        /* WebSocket used by the AbstractWebsocketService implementation. */
        this._socket = null;
        /* Indication of the connection status. */
        this.connection = "DISCONNECTED";
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
     * Sends an object to the underlying WebSocket stream. That object
     * gets serialized to JSON before it's being sent.
     *
     * @param object Object to send.
     */
    AbstractWebsocketService.prototype.send = function (object) {
        return this.sendstr(JSON.stringify(object));
    };
    /**
     * Sends a raw string to the underlying WebSocket stream.
     *
     * @param str String to write to the stream.
     */
    AbstractWebsocketService.prototype.sendstr = function (str) {
        if (this.connection == "WAITING") {
            this._socket.next(str);
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Dispatches a new timer that will wait for 30seconds and try
     * to re-establish the connection.
     */
    AbstractWebsocketService.prototype.dispatchTimer = function () {
        console.log("Dispatching timer to re-establish connection in 30s...");
        var timer = Rx_1.Observable.timer(30000);
        timer.first().subscribe(function () {
            console.log("Re-establishing connection.");
            this.createSocket();
        }.bind(this));
    };
    /**
     * This method is invoked whenever the WebSocket reports a connection error.
     *
     * @param error
     */
    AbstractWebsocketService.prototype.onSocketError = function (error) {
        console.log("Error occurred with socket to '" + this._url + "':" + error);
        this.connection = "ERROR";
        this._socket.unsubscribe();
        this._socket = null;
        if (this.reestablish)
            this.dispatchTimer();
    };
    ;
    /**
     * This method is invoked whenever the WebSocket reports that it was closed.
     */
    AbstractWebsocketService.prototype.onSocketClose = function () {
        console.log("Socket to '" + this._url + "' was closed.");
        this.connection = "DISCONNECTED";
        this._socket.unsubscribe();
        this._socket = null;
        if (this.reestablish)
            this.dispatchTimer();
    };
    AbstractWebsocketService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [String, Boolean])
    ], AbstractWebsocketService);
    return AbstractWebsocketService;
}());
exports.AbstractWebsocketService = AbstractWebsocketService;
//# sourceMappingURL=AbstractWebsocketService.js.map