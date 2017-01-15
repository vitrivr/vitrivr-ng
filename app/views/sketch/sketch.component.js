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
var SketchComponent = (function () {
    function SketchComponent() {
        this.width = 500;
        this.height = 500;
        this.palette = [
            new Color("black", "#000000"),
            new Color("#1a1a1a", "#1a1a1a"),
            new Color("#333333", " #333333"),
            new Color("#404040", " #404040"),
            new Color("#666666", "#666666"),
            new Color("gray", "#808080"),
            new Color("#b3b3b3", "#b3b3b3"),
            new Color("#cccccc", "#cccccc"),
            new Color("#e6e6e6", "#e6e6e6"),
            new Color("white", "#ffffff"),
            new Color("red", "#ff0000"),
            new Color("green", "#00ff00"),
            new Color("green", "#0000ff"),
            new Color("yellow", "#ffff00")
        ];
        this.lineWidth = 1;
        this.paint = false;
        this.activeColor = this.palette[0];
        this.clicks = [];
    }
    SketchComponent.prototype.ngAfterViewInit = function () {
        var canvas = this.canvas.nativeElement;
        this.context = canvas.getContext("2d");
        if (this.context != undefined && this.background != undefined) {
            var image_1 = new Image();
            var ctx_1 = this.context;
            image_1.onload = function () {
                ctx_1.drawImage(image_1, 0, 0);
            };
            image_1.src = this.background;
        }
    };
    SketchComponent.prototype.onMousedown = function (event) {
        if (event.target == this.canvas.nativeElement) {
            this.paint = true;
            this.clicks.push(new Click(event.x - this.canvas.nativeElement.offsetLeft, event.y - this.canvas.nativeElement.offsetTop, this.activeColor, this.lineWidth, false));
            this.redraw();
        }
    };
    ;
    SketchComponent.prototype.onMouseup = function (event) {
        this.paint = false;
    };
    ;
    SketchComponent.prototype.onMouseleave = function (event) {
        this.paint = false;
    };
    ;
    SketchComponent.prototype.onMousemove = function (event) {
        if (this.paint && event.target == this.canvas.nativeElement) {
            this.clicks.push(new Click(event.x - this.canvas.nativeElement.offsetLeft, event.y - this.canvas.nativeElement.offsetTop, this.activeColor, this.lineWidth, true));
            this.redraw();
        }
    };
    ;
    SketchComponent.prototype.onChange = function (event) {
        var URL = window.URL;
        this.setImageBase64(URL.createObjectURL(event.target.files[0]));
    };
    ;
    SketchComponent.prototype.clearCanvas = function () {
        this.clicks = [];
        this.background = null;
        this.redraw();
    };
    SketchComponent.prototype.getImage = function () {
        return this.context.getImageData(0, 0, this.width, this.height);
    };
    SketchComponent.prototype.getImageBase64 = function () {
        return this.context.canvas.toDataURL("image/png");
    };
    /**
     * Sets the background-image of the sketch component based
     * on a based64 encoded data chunk.
     *
     * @param data
     */
    SketchComponent.prototype.setImageBase64 = function (data) {
        var t = this;
        this.background = new Image();
        this.background.src = data;
        this.background.onload = function () { t.redraw(); };
    };
    SketchComponent.prototype.loadImage = function () {
        var imageloader = this.imageloader.nativeElement;
        imageloader.click();
    };
    SketchComponent.prototype.setColor = function (color) {
        this.activeColor = color;
    };
    SketchComponent.prototype.redraw = function () {
        /* Clear the context. */
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.lineJoin = "round";
        /* First draw the background image. */
        if (this.background != undefined) {
            this.context.drawImage(this.background, 0, 0, this.context.canvas.width, this.context.canvas.height);
        }
        /* Then draw on top of it. */
        for (var i = 0; i < this.clicks.length; i++) {
            this.context.beginPath();
            this.context.strokeStyle = this.clicks[i].color.value;
            this.context.lineWidth = this.clicks[i].line;
            if (this.clicks[i].dragging && i) {
                this.context.moveTo(this.clicks[i - 1].x, this.clicks[i - 1].y);
            }
            else {
                this.context.moveTo(this.clicks[i].x - 1, this.clicks[i].y);
            }
            this.context.lineTo(this.clicks[i].x, this.clicks[i].y);
            this.context.closePath();
            this.context.stroke();
        }
    };
    __decorate([
        core_1.ViewChild('sketch'), 
        __metadata('design:type', Object)
    ], SketchComponent.prototype, "canvas", void 0);
    __decorate([
        core_1.ViewChild('imageloader'), 
        __metadata('design:type', Object)
    ], SketchComponent.prototype, "imageloader", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], SketchComponent.prototype, "width", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], SketchComponent.prototype, "height", void 0);
    __decorate([
        core_1.HostListener('mousedown', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [MouseEvent]), 
        __metadata('design:returntype', void 0)
    ], SketchComponent.prototype, "onMousedown", null);
    __decorate([
        core_1.HostListener('mouseup', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [MouseEvent]), 
        __metadata('design:returntype', void 0)
    ], SketchComponent.prototype, "onMouseup", null);
    __decorate([
        core_1.HostListener('mouseleave', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [MouseEvent]), 
        __metadata('design:returntype', void 0)
    ], SketchComponent.prototype, "onMouseleave", null);
    __decorate([
        core_1.HostListener('mousemove', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [MouseEvent]), 
        __metadata('design:returntype', void 0)
    ], SketchComponent.prototype, "onMousemove", null);
    __decorate([
        core_1.HostListener('change', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], SketchComponent.prototype, "onChange", null);
    SketchComponent = __decorate([
        core_1.Component({
            selector: 'sketch',
            styles: ["\n        input[type='file'] {\n            display:none;\n        }\n        .toolbar {\n             border: solid 1px lightgrey;\n             height: 50px;\n        }\n        .toolbar-item {\n            margin-left:5px;\n            margin-right:5px;\n        }\n        .palette {\n            position: relative;\n            display: inline-block;\n        }\n        .palette button {\n            width: 25px;\n            height: 25px\n        }\n        .palette:hover .palette-content {\n            display: block;\n        }\n        .palette-content {\n            display: none;\n            position: absolute;\n            background-color: #f9f9f9;\n            min-width: 270px;\n            max-width: 270px;\n            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);\n        }\n        .palette-field {\n            float:left;\n            height: 25px;\n            width: 25px;\n            margin: 1px 1px 1px 1px;\n        }\n    "],
            templateUrl: './app/views/sketch/sketch.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], SketchComponent);
    return SketchComponent;
}());
exports.SketchComponent = SketchComponent;
var Click = (function () {
    function Click(x, y, color, line, dragging) {
        this.dragging = false;
        this.x = x;
        this.y = y;
        this.color = color;
        this.line = line;
        this.dragging = dragging;
    }
    return Click;
}());
exports.Click = Click;
var Color = (function () {
    function Color(name, value) {
        this.name = name;
        this.value = value;
    }
    ;
    return Color;
}());
exports.Color = Color;
//# sourceMappingURL=sketch.component.js.map