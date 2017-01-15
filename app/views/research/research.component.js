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
var material_1 = require("@angular/material");
var query_types_1 = require("../../types/query.types");
var queries_service_1 = require("../../services/queries/queries.service");
var ResearchComponent = (function () {
    function ResearchComponent(_queryTermService, _dialog) {
        this._queryTermService = _queryTermService;
        this._dialog = _dialog;
        this.activeTypes = [
            "AUDIO",
            "VIDEO",
            "IMAGE"
        ];
        this.containers = [];
    }
    /**
     *
     */
    ResearchComponent.prototype.addQueryTermContainer = function () {
        var term = new query_types_1.QueryContainer();
        term.imageQueryTerm = new query_types_1.ImageQueryTerm();
        this.containers.push(term);
    };
    /**
     *
     */
    ResearchComponent.prototype.search = function () {
        var query = this._queryTermService.buildQuery(this.activeTypes, this.containers);
        this._queryTermService.query(query);
    };
    /**
     *
     * @param type
     * @returns {boolean}
     */
    ResearchComponent.prototype.isActive = function (type) {
        return this.activeTypes.indexOf(type) > -1;
    };
    /**
     *
     * @param type
     */
    ResearchComponent.prototype.toggleActive = function (type) {
        var idx = this.activeTypes.indexOf(type);
        if (idx == -1) {
            this.activeTypes.push(type);
        }
        else {
            this.activeTypes.slice(idx, 1);
        }
    };
    ResearchComponent = __decorate([
        core_1.Component({
            selector: 'research',
            templateUrl: './app/views/research/research.component.html'
        }), 
        __metadata('design:paramtypes', [queries_service_1.QueryService, material_1.MdDialog])
    ], ResearchComponent);
    return ResearchComponent;
}());
exports.ResearchComponent = ResearchComponent;
//# sourceMappingURL=research.component.js.map