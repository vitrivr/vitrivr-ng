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
var sketchdialog_component_1 = require("../sketch/sketchdialog.component");
var material_1 = require('@angular/material');
var query_types_1 = require("../../types/query.types");
var ImageQueryTermComponent = (function () {
    function ImageQueryTermComponent(dialog) {
        this.dialog = dialog;
    }
    /**
     *
     * @param event
     */
    ImageQueryTermComponent.prototype.sliderChanged = function (event) {
        this.imageTerm.setting(this.sliderSetting);
    };
    ImageQueryTermComponent.prototype.edit = function () {
        var _this = this;
        var dialogRef = this.dialog.open(sketchdialog_component_1.SketchDialogComponent);
        dialogRef.componentInstance.sketchpad.setImageBase64(this.previewimg.nativeElement.src);
        dialogRef.afterClosed().subscribe(function (result) {
            if (result != undefined) {
                _this.previewimg.nativeElement.src = result;
                _this.imageTerm.image = result;
            }
        });
    };
    __decorate([
        core_1.ViewChild('previewimg'), 
        __metadata('design:type', Object)
    ], ImageQueryTermComponent.prototype, "previewimg", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', query_types_1.ImageQueryTerm)
    ], ImageQueryTermComponent.prototype, "imageTerm", void 0);
    ImageQueryTermComponent = __decorate([
        core_1.Component({
            selector: 'qt-image',
            template: "\n        <img #previewimg style=\"width:220px; height:220px; border:solid 1px;\" (click)=\"edit()\"/>\n        <md-slider min=\"1\" max=\"3\" step=\"1\" [(ngModel)]=\"sliderSetting\" (change)=\"sliderChanged($event)\"></md-slider>\n    "
        }), 
        __metadata('design:paramtypes', [material_1.MdDialog])
    ], ImageQueryTermComponent);
    return ImageQueryTermComponent;
}());
exports.ImageQueryTermComponent = ImageQueryTermComponent;
//# sourceMappingURL=imagequeryterm.component.js.map