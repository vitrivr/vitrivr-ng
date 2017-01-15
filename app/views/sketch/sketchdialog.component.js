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
var material_1 = require('@angular/material');
var sketch_component_1 = require("./sketch.component");
var SketchDialogComponent = (function () {
    function SketchDialogComponent(dialogRef) {
        this.dialogRef = dialogRef;
    }
    __decorate([
        core_1.ViewChild('sketch'), 
        __metadata('design:type', sketch_component_1.SketchComponent)
    ], SketchDialogComponent.prototype, "sketchpad", void 0);
    SketchDialogComponent = __decorate([
        core_1.Component({
            selector: 'sketch-dialog-component',
            template: "\n       <h2 md-dialog-title>Create image</h2>\n       <md-dialog-content>\n            <sketch #sketch></sketch>\n       </md-dialog-content>\n       <md-dialog-actions>\n            <button (click)=\"dialogRef.close(sketchpad.getImageBase64())\"md-button>Save</button>\n       </md-dialog-actions>\n    "
        }), 
        __metadata('design:paramtypes', [material_1.MdDialogRef])
    ], SketchDialogComponent);
    return SketchDialogComponent;
}());
exports.SketchDialogComponent = SketchDialogComponent;
//# sourceMappingURL=sketchdialog.component.js.map