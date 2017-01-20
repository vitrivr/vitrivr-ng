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
var queries_service_1 = require("../../services/queries/queries.service");
var containers_1 = require("../../types/containers");
var app_config_1 = require("../../configuration/app.config");
var GalleryComponent = (function () {
    /**
     * Default constructor.
     *
     * @param _api Reference to the CineastAPI. Gets injected by DI.
     * @param _config
     * @param _queryService
     */
    function GalleryComponent(_config, _queryService) {
        var _this = this;
        this._config = _config;
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
            cache.sort(function (a, b) { return containers_1.MediaObjectScoreContainer.compareAsc(a, b); });
        }
        this.mediaobjects = cache;
    };
    GalleryComponent = __decorate([
        core_1.Component({
            selector: 'gallery',
            templateUrl: './app/views/gallery/gallery.component.html',
            styleUrls: ['app/views/gallery/gallery.component.css']
        }), 
        __metadata('design:paramtypes', [app_config_1.Configuration, queries_service_1.QueryService])
    ], GalleryComponent);
    return GalleryComponent;
}());
exports.GalleryComponent = GalleryComponent;
//# sourceMappingURL=gallery.component.js.map