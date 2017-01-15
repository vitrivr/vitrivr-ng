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
var websocket_interface_1 = require("../websocket.interface");
var app_config_1 = require("../../configuration/app.config");
var query_types_1 = require("../../types/query.types");
var containers_1 = require("../../types/containers");
var QueryService = (function (_super) {
    __extends(QueryService, _super);
    /**
     * Default constructor.
     *
     * @param _configuration Gets injected by DI.
     */
    function QueryService(_configuration) {
        _super.call(this, _configuration, 'find/object/similar');
        /** A Map that maps objectId's to their MediaObjectScoreContainer. This is where the results of a query are assembled. */
        this.similarities = new Map();
        /** A Map that maps segmentId's to objectId's. This is a cache-structure. */
        this.segment_to_object_map = new Map();
        /** ID that identifies an ongoing query. If it's null, then no query is ongoing. */
        this.queryId = null;
        console.log("QueryService is up and running!");
    }
    /**
     *
     * @param types
     * @param containers
     * @returns {Query}
     */
    QueryService.prototype.buildQuery = function (types, containers) {
        var query = new query_types_1.Query();
        for (var _i = 0, containers_2 = containers; _i < containers_2.length; _i++) {
            var container = containers_2[_i];
            query.containers.push(container);
        }
        for (var _a = 0, types_1 = types; _a < types_1.length; _a++) {
            var type = types_1[_a];
            query.types.push(type);
        }
        return query;
    };
    /**
     * Starts a new query - success is indicated by the return value.
     *
     * Note: Queries can only be started if no query is ongoing.
     *
     * @param query
     * @returns {boolean} true if query was issued, false otherwise.
     */
    QueryService.prototype.query = function (query) {
        if (this.queryId == null) {
            this.send(query);
            return true;
        }
        else {
            return false;
        }
    };
    /**
     *  Starts a new Query in response to a QR_START message. Stores the
     *  queryId for further reference and purges the similarities and segment_to_object_map.
     *
     * @param id ID of the new query. Used to associate responses.
     */
    QueryService.prototype.startNewQuery = function (id) {
        this.similarities.clear();
        this.segment_to_object_map.clear();
        this.queryId = id;
    };
    /**
     * Finalizes a running Query by setting the queryId field to null. Does
     * some cleanup.
     */
    QueryService.prototype.finalizeQuery = function () {
        this.queryId = null;
        this.segment_to_object_map.clear();
    };
    /**
     * This is where the magic happens: Subscribes to messages from the underlying WebSocket and orchestrates the
     * assembly of the individual pieces of QueryResults.
     *
     * @param message
     */
    QueryService.prototype.onSocketMessage = function (message) {
        var parsed = JSON.parse(message);
        switch (parsed.type) {
            case "QR_START":
                var qs = parsed;
                this.startNewQuery(qs.queryId);
                break;
            case "QR_SEGMENT":
                var seg = parsed;
                if (seg.queryId == this.queryId) {
                    for (var _i = 0, _a = seg.content; _i < _a.length; _i++) {
                        var segment = _a[_i];
                        if (!this.similarities.has(segment.objectId))
                            this.similarities.set(segment.objectId, new containers_1.MediaObjectScoreContainer());
                        this.similarities.get(segment.objectId).addMediaSegment(segment);
                        this.segment_to_object_map.set(segment.segmentId, segment.objectId);
                    }
                }
                break;
            case "QR_SIMILARITY":
                var sim = parsed;
                if (sim.queryId == this.queryId) {
                    for (var _b = 0, _c = sim.content; _b < _c.length; _b++) {
                        var similarity = _c[_b];
                        var objectId = this.segment_to_object_map.get(similarity.key);
                        if (objectId != undefined) {
                            if (!this.similarities.has(objectId))
                                this.similarities.set(objectId, new containers_1.MediaObjectScoreContainer());
                            this.similarities.get(objectId).addSimilarity(sim.category, similarity);
                        }
                    }
                }
                break;
            case "QR_OBJECT":
                var obj = parsed;
                if (obj.queryId == this.queryId) {
                    for (var _d = 0, _e = obj.content; _d < _e.length; _d++) {
                        var object = _e[_d];
                        if (!this.similarities.has(object.objectId))
                            this.similarities.set(object.objectId, new containers_1.MediaObjectScoreContainer());
                        this.similarities.get(object.objectId).mediaObject = object;
                    }
                }
                break;
            case "QR_END":
                this.finalizeQuery();
                break;
        }
        if (this.onServiceNext != undefined)
            this.onServiceNext(message);
    };
    QueryService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [app_config_1.Configuration])
    ], QueryService);
    return QueryService;
}(websocket_interface_1.AbstractWebsocketService));
exports.QueryService = QueryService;
//# sourceMappingURL=queries.service.js.map