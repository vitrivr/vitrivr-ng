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
var SketchCanvas = (function () {
    function SketchCanvas() {
        this.width = 400;
        this.height = 400;
        this.paint = false;
        this.last = null;
        this.current = null;
    }
    SketchCanvas.prototype.ngAfterViewInit = function () {
        var canvas = this.canvas.nativeElement;
        this.context = canvas.getContext("2d");
        this.context.lineJoin = "round";
    };
    SketchCanvas.prototype.onMousedown = function (event) {
        this.paint = true;
        this.current = new Point(event.x - this.canvas.nativeElement.offsetLeft, event.y - this.canvas.nativeElement.offsetTop);
        SketchCanvas.drawCircle(this.context, this.current);
        this.last = this.current;
    };
    ;
    SketchCanvas.prototype.onMouseup = function (event) {
        this.paint = false;
    };
    ;
    SketchCanvas.prototype.onMouseLeave = function (event) {
        this.paint = false;
    };
    ;
    SketchCanvas.prototype.onMousemove = function (event) {
        if (this.paint && event.target == this.canvas.nativeElement) {
            this.current = new Point(event.x - this.canvas.nativeElement.offsetLeft, event.y - this.canvas.nativeElement.offsetTop);
            if (this.last !== null) {
                SketchCanvas.drawLine(this.context, this.last, this.current);
            }
            this.last = this.current;
        }
    };
    ;
    SketchCanvas.prototype.onResize = function (event) {
        event.target.innerWidth;
    };
    /**
     * Clears the canvas; both the drawings and the background.
     */
    SketchCanvas.prototype.clearCanvas = function () {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    };
    /**
     *
     * @returns {ImageData}
     */
    SketchCanvas.prototype.getImage = function () {
        return this.context.getImageData(0, 0, this.width, this.height);
    };
    /**
     *
     * @returns {string}
     */
    SketchCanvas.prototype.getImageBase64 = function () {
        return this.context.canvas.toDataURL("image/png");
    };
    /**
     * Sets the background-image of the sketch component based
     * on a based64 encoded data chunk.
     *
     * @param data
     */
    SketchCanvas.prototype.setImageBase64 = function (data) {
        var image = new Image();
        image.src = data;
        image.onload = function () { this.context.drawImage(image, 0, 0, this.context.canvas.width, this.context.canvas.height); }.bind(this);
    };
    /**
     * Sets the active color of the SketchPad.
     *
     * @param color Hex-color string.
     */
    SketchCanvas.prototype.setActiveColor = function (color) {
        this.context.strokeStyle = this.context.fillStyle = color;
    };
    /**
     * Sets the linesize of the SketchPad.
     *
     * @param size New linesize
     */
    SketchCanvas.prototype.setLineSize = function (size) {
        if (size > 0) {
            this.context.lineWidth = size;
        }
    };
    /**
     *
     * @param ctx
     * @param p
     */
    SketchCanvas.drawCircle = function (ctx, p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    };
    /**
     *
     * @param ctx
     * @param from
     * @param to
     */
    SketchCanvas.drawLine = function (ctx, from, to) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.closePath();
        ctx.stroke();
    };
    __decorate([
        core_1.ViewChild('sketch'), 
        __metadata('design:type', Object)
    ], SketchCanvas.prototype, "canvas", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], SketchCanvas.prototype, "width", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], SketchCanvas.prototype, "height", void 0);
    __decorate([
        core_1.HostListener('mousedown', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [MouseEvent]), 
        __metadata('design:returntype', void 0)
    ], SketchCanvas.prototype, "onMousedown", null);
    __decorate([
        core_1.HostListener('mouseup', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [MouseEvent]), 
        __metadata('design:returntype', void 0)
    ], SketchCanvas.prototype, "onMouseup", null);
    __decorate([
        core_1.HostListener('mouseleave', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [MouseEvent]), 
        __metadata('design:returntype', void 0)
    ], SketchCanvas.prototype, "onMouseLeave", null);
    __decorate([
        core_1.HostListener('mousemove', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [MouseEvent]), 
        __metadata('design:returntype', void 0)
    ], SketchCanvas.prototype, "onMousemove", null);
    __decorate([
        core_1.HostListener('window:resize', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], SketchCanvas.prototype, "onResize", null);
    SketchCanvas = __decorate([
        core_1.Component({
            selector: 'sketch-canvas',
            template: "<canvas #sketch width='{{width}}' height='{{height}}' style=\"border: solid 1px;\" ></canvas>"
        }), 
        __metadata('design:paramtypes', [])
    ], SketchCanvas);
    return SketchCanvas;
}());
exports.SketchCanvas = SketchCanvas;
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
exports.Point = Point;
//# sourceMappingURL=sketch-canvas.component.js.map