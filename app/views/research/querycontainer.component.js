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
var QueryContainerComponent = (function () {
    function QueryContainerComponent() {
    }
    /**
     *
     * @returns {boolean}
     */
    QueryContainerComponent.prototype.hasImage = function () {
        return this.container.imageQueryTerm != undefined;
    };
    /**
     *
     */
    QueryContainerComponent.prototype.remove = function () {
        var index = this.inList.indexOf(this.container);
        if (index > -1) {
            this.inList.splice(index, 1);
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], QueryContainerComponent.prototype, "container", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], QueryContainerComponent.prototype, "inList", void 0);
    QueryContainerComponent = __decorate([
        core_1.Component({
            selector: 'query-container',
            template: "\n        <md-card style=\"margin:10px;padding:10px;\">\n            <md-card-header>\n                 <button class=\"app-icon-button\" (click)=\"remove()\"><md-icon>close</md-icon></button>\n                 <div style=\"width:90%;\"></div>\n                 <button class=\"app-icon-button\" (click)=\"remove()\"><md-icon>close</md-icon></button>\n            </md-card-header>\n            <md-card-content>\n                <qt-image *ngIf=\"hasImage()\" [imageTerm]=\"hasImage() ? container.imageQueryTerm : null\"></qt-image>\n            </md-card-content>\n        </md-card>\n    "
        }), 
        __metadata('design:paramtypes', [])
    ], QueryContainerComponent);
    return QueryContainerComponent;
}());
exports.QueryContainerComponent = QueryContainerComponent;
//# sourceMappingURL=querycontainer.component.js.map