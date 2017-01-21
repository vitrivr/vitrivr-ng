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
var queries_service_1 = require("./core/queries/queries.service");
var AppComponent = (function () {
    /**
     * Default constructor. Subscribe for PING messages at the CineastAPI.
     *
     * @param _queryService
     */
    function AppComponent(_queryService) {
        var _this = this;
        this._queryService = _queryService;
        /* Indicator whether the progress bar should be visible. */
        this.loading = false;
        _queryService.observable()
            .filter(function (msg) { return ["STARTED", "ENDED"].indexOf(msg) > -1; })
            .subscribe(function (msg) { return _this.onQueryStateChange(msg); });
    }
    /**
     *
     * @param msg
     */
    AppComponent.prototype.onQueryStateChange = function (msg) {
        if (msg == "STARTED") {
            this.loading = true;
        }
        else if (msg == "ENDED") {
            this.loading = false;
        }
    };
    AppComponent = __decorate([
        core_1.Component({
            styles: ["\n    md-sidenav {\n        width: 300px;\n    }\n  "],
            selector: 'vitrivr',
            templateUrl: './app/app.component.html'
        }), 
        __metadata('design:paramtypes', [queries_service_1.QueryService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map