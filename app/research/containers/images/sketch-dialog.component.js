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
var sketch_canvas_component_1 = require("../../../shared/components/sketch/sketch-canvas.component");
var angular2_color_picker_1 = require('angular2-color-picker');
var SketchDialogComponent = (function () {
    function SketchDialogComponent(dialogRef, cpService) {
        this.dialogRef = dialogRef;
        this.cpService = cpService;
        this.color = "#000000";
    }
    /**
     * Change listener for the input field (File chooser). Handles the
     * image upload.
     *
     * @param event
     */
    SketchDialogComponent.prototype.onChange = function (event) {
        var URL = window.URL;
        this.sketchpad.setImageBase64(URL.createObjectURL(event.target.files[0]));
    };
    ;
    /**
     *
     */
    SketchDialogComponent.prototype.getSketchPad = function () {
        return this.sketchpad;
    };
    /**
     * Triggered when a color value is selected.
     *
     * @param event
     */
    SketchDialogComponent.prototype.onColorChange = function (event) {
        this.color = event;
        this.sketchpad.setActiveColor(this.color);
    };
    /**
     * Triggered when the slider-value for the line-size changes.
     *
     * @param event
     */
    SketchDialogComponent.prototype.onLineSizeChange = function (size) {
        this.sketchpad.setLineSize(size.value);
    };
    /**
     * Triggered when the 'Clear canvas' menu-item is pressed.
     *
     * Clears the canvas
     */
    SketchDialogComponent.prototype.onClearCanvas = function () {
        this.sketchpad.clearCanvas();
    };
    /**
     * Triggered when the 'load-image' menu-item is pressed.
     *
     * Opens a file-chooser.
     */
    SketchDialogComponent.prototype.onLoadImage = function () {
        this.imageloader.nativeElement.click();
    };
    __decorate([
        core_1.ViewChild('sketch'), 
        __metadata('design:type', sketch_canvas_component_1.SketchCanvas)
    ], SketchDialogComponent.prototype, "sketchpad", void 0);
    __decorate([
        core_1.ViewChild('imageloader'), 
        __metadata('design:type', Object)
    ], SketchDialogComponent.prototype, "imageloader", void 0);
    __decorate([
        core_1.HostListener('change', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], SketchDialogComponent.prototype, "onChange", null);
    SketchDialogComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'sketchpad',
            templateUrl: './sketch-dialog.component.html'
        }), 
        __metadata('design:paramtypes', [material_1.MdDialogRef, angular2_color_picker_1.ColorPickerService])
    ], SketchDialogComponent);
    return SketchDialogComponent;
}());
exports.SketchDialogComponent = SketchDialogComponent;
//# sourceMappingURL=sketch-dialog.component.js.map