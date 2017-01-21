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
var media_object_score_container_model_1 = require("../core/queries/media-object-score-container.model");
var queries_service_1 = require("../core/queries/queries.service");
var GalleryComponent = (function () {
    /**
     * Default constructor.
     *
     * @param _api Reference to the CineastAPI. Gets injected by DI.
     * @param _config
     * @param _queryService
     */
    function GalleryComponent(_queryService) {
        var _this = this;
        this._queryService = _queryService;
        _queryService.observable()
            .filter(function (msg) { return (msg == "UPDATED"); })
            .subscribe(function (msg) { return _this.onQueryStateChange(); });
    }
    /**
     * Invoked whenever the QueryService reports that the results were updated. Causes
     * the gallery to be re-rendered.
     */
    GalleryComponent.prototype.onQueryStateChange = function () {
        var cache = [];
        this._queryService.similarities.forEach(function (value, key) {
            if (value.show())
                cache.push(value);
        });
        if (cache.length > 1) {
            cache.sort(function (a, b) { return media_object_score_container_model_1.MediaObjectScoreContainer.compareAsc(a, b); });
        }
        this.mediaobjects = cache;
    };
    GalleryComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'gallery',
            templateUrl: 'gallery.component.html',
            styleUrls: ['gallery.component.css']
        }), 
        __metadata('design:paramtypes', [queries_service_1.QueryService])
    ], GalleryComponent);
    return GalleryComponent;
}());
exports.GalleryComponent = GalleryComponent;
//# sourceMappingURL=gallery.component.js.map