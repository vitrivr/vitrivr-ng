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
var cineast_api_service_1 = require("../api/cineast-api.service");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var media_object_score_container_model_1 = require("./media-object-score-container.model");
var query_model_1 = require("../../shared/model/messages/query.model");
var QueryService = (function () {
    /**
     * Default constructor.
     *
     * @param _api Reference to the CineastAPI. Gets injected by DI.
     */
    function QueryService(_api) {
        var _this = this;
        this._api = _api;
        /** A Map that maps objectId's to their MediaObjectScoreContainer. This is where the results of a research are assembled. */
        this.similarities = new Map();
        /** A Map that maps segmentId's to objectId's. This is a cache-structure. */
        this.segment_to_object_map = new Map();
        /** ID that identifies an ongoing research. If it's null, then no research is ongoing. */
        this.queryId = null;
        /** */
        this.stateSubject = new BehaviorSubject_1.BehaviorSubject("NONE");
        _api.observable()
            .filter(function (msg) { return ["QR_START", "QR_END", "QR_SIMILARITY", "QR_OBJECT", "QR_SEGMENT"].indexOf(msg[0]) > -1; })
            .subscribe(function (msg) { return _this.onApiMessage(msg[1]); });
        console.log("QueryService is up and running!");
    }
    /**
     *
     * @param types
     * @param containers
     * @returns {Query}
     */
    QueryService.prototype.buildQuery = function (types, containers) {
        var query = new query_model_1.Query();
        for (var _i = 0, containers_1 = containers; _i < containers_1.length; _i++) {
            var container = containers_1[_i];
            query.containers.push(container);
        }
        for (var _a = 0, types_1 = types; _a < types_1.length; _a++) {
            var type = types_1[_a];
            query.types.push(type);
        }
        return query;
    };
    /**
     * Starts a new research - success is indicated by the return value.
     *
     * Note: Queries can only be started if no research is currently ongoing.
     *
     * @param query
     * @returns {boolean} true if research was issued, false otherwise.
     */
    QueryService.prototype.query = function (query) {
        if (this.queryId == null) {
            this._api.send(query);
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Returns an Observable that allows an Observer to be notified about
     * state changes in the QueryService (Started, Ended, Resultset updated).
     *
     * @returns {Observable<T>}
     */
    QueryService.prototype.observable = function () {
        return this.stateSubject.asObservable();
    };
    /**
     *  Starts a new Query in response to a QR_START message. Stores the
     *  queryId for further reference and purges the similarities and segment_to_object_map.
     *
     * @param id ID of the new research. Used to associate responses.
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
    QueryService.prototype.onApiMessage = function (message) {
        var parsed = JSON.parse(message);
        switch (parsed.messagetype) {
            case "QR_START":
                var qs = parsed;
                this.startNewQuery(qs.queryId);
                this.stateSubject.next("STARTED");
                break;
            case "QR_SEGMENT":
                var seg = parsed;
                if (seg.queryId == this.queryId) {
                    for (var _i = 0, _a = seg.content; _i < _a.length; _i++) {
                        var segment = _a[_i];
                        if (!this.similarities.has(segment.objectId))
                            this.similarities.set(segment.objectId, new media_object_score_container_model_1.MediaObjectScoreContainer());
                        this.similarities.get(segment.objectId).addMediaSegment(segment);
                        this.segment_to_object_map.set(segment.segmentId, segment.objectId);
                    }
                }
                this.stateSubject.next("UPDATED");
                break;
            case "QR_SIMILARITY":
                var sim = parsed;
                if (sim.queryId == this.queryId) {
                    for (var _b = 0, _c = sim.content; _b < _c.length; _b++) {
                        var similarity = _c[_b];
                        var objectId = this.segment_to_object_map.get(similarity.key);
                        if (objectId != undefined) {
                            if (!this.similarities.has(objectId))
                                this.similarities.set(objectId, new media_object_score_container_model_1.MediaObjectScoreContainer());
                            this.similarities.get(objectId).addSimilarity(sim.category, similarity);
                        }
                    }
                }
                this.stateSubject.next("UPDATED");
                break;
            case "QR_OBJECT":
                var obj = parsed;
                if (obj.queryId == this.queryId) {
                    for (var _d = 0, _e = obj.content; _d < _e.length; _d++) {
                        var object = _e[_d];
                        if (!this.similarities.has(object.objectId))
                            this.similarities.set(object.objectId, new media_object_score_container_model_1.MediaObjectScoreContainer());
                        this.similarities.get(object.objectId).mediaObject = object;
                    }
                }
                this.stateSubject.next("UPDATED");
                break;
            case "QR_END":
                this.finalizeQuery();
                this.stateSubject.next("ENDED");
                break;
        }
    };
    QueryService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [cineast_api_service_1.CineastAPI])
    ], QueryService);
    return QueryService;
}());
exports.QueryService = QueryService;
//# sourceMappingURL=queries.service.js.map