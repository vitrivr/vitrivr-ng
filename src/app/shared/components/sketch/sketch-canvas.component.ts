import {Component, ViewChild, HostListener, Input, AfterViewInit, ElementRef, OnInit} from '@angular/core';

@Component({
    selector: 'sketch-canvas',
    template:`<canvas #sketch width='{{width}}' height='{{height}}' style="border: solid 1px;" (mousedown)="onMousedown($event)" (mouseup)="onMouseup($event)" (mouseup)="onMouseup($event)" (mouseleave)="onMouseLeave($event)" (mousemove)="onMousemove($event)" (drop)="onCanvasDropped($event)" (dragover)="onCanvasDragOver($event)"></canvas>`
})

export class SketchCanvas implements OnInit  {
    @ViewChild('sketch') private canvas: ElementRef;

    @Input() width: number = 400;
    @Input() height: number = 400;

    private context: CanvasRenderingContext2D;
    private paint = false;
    private last: Point = null;
    private current: Point = null;

    /**
     * Lifecycle Hook (onInit): Initialises the drawing context.
     */
    public ngOnInit() {
        let canvas = this.canvas.nativeElement;
        this.context = canvas.getContext("2d");
    }

    /**
     *
     * @param event
     */
    public onMousedown(event: MouseEvent) {
        this.paint = true;
        this.current = new Point(event.offsetX, event.offsetY);
        SketchCanvas.drawCircle(this.context, this.current);
        this.last = this.current;
    };

    /**
     *
     * @param event
     */
    public onMouseup(event: MouseEvent) {
        this.paint = false;
    };

    /**
     *
     * @param event
     */
    public onMouseLeave(event: MouseEvent) {
        this.paint = false;
    };

    /**
     *
     * @param event
     */
    public onMousemove(event: MouseEvent) {
        if(this.paint && event.target == this.canvas.nativeElement) {
            this.current = new Point(event.offsetX, event.offsetY);
            if (this.last !== null) {
                SketchCanvas.drawLine(this.context, this.last, this.current);
            }
            this.last = this.current;
        }
    };

    /**
     * Fired whenever something is dragged over the canvas.
     *
     * @param event
     */
    public onCanvasDragOver(event: any) {
        event.preventDefault();
    }

    /**
     * Handles the case in which an object is dropped over the sketch canvas. If the object is a file, that
     * object is treated as image and loaded.
     *
     * @param event Drop event
     */
    public onCanvasDropped(event: any) {
        /* Prevent propagation. */
        event.preventDefault();
        event.stopPropagation();

        /* Extract file (if available) and display it. */
        if (event.dataTransfer.files.length > 0) {
            this.setImageBase64(URL.createObjectURL(event.dataTransfer.files.item(0)));
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event : any) {
        event.target.innerWidth;
    }

    /**
     * Clears the canvas; both the drawings and the background.
     */
    public clearCanvas() {
        this.context.clearRect(0,0,this.context.canvas.width,this.context.canvas.height);
    }

    /**
     * Getter for the rendered image data.
     *
     * @returns {ImageData}
     */
    public getImage() {
        return this.context.getImageData(0,0,this.width, this.height);
    }

    /**
     * Getter for the base 64 encoded, rendered image data.
     *
     * @returns {string}
     */
    public getImageBase64() {
        return this.context.canvas.toDataURL("image/png");
    }

    /**
     * Sets the background-image of the sketch component based
     * on a based64 encoded data chunk.
     *
     * @param data
     */
    public setImageBase64(data : string) {
        let image = new Image();
        image.src = data;
        image.onload = function() { this.context.drawImage(image, 0, 0, this.context.canvas.width, this.context.canvas.height);}.bind(this);
    }

    /**
     * Sets the active color of the SketchPad.
     *
     * @param color Hex-color string.
     */
    public setActiveColor(color : string) {
        this.context.strokeStyle =  this.context.fillStyle = color;
    }

    /**
     * Sets the linesize of the SketchPad.
     *
     * @param size New linesize
     */
    public setLineSize(size : number) {
        if (size > 0) {
            this.context.lineWidth = size;
        }
    }

    /**
     * Fills the Canvas with the configured fill color.
     */
    public fillCanvas() {
        this.context.beginPath();
        this.context.rect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.fill();
    }

    /**
     *
     * @param ctx
     * @param p
     */
    public static drawCircle(ctx: CanvasRenderingContext2D, p: Point) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, 2 * Math.PI);
        ctx.lineJoin = "round";
        ctx.closePath();
        ctx.fill();
    }

    /**
     *
     * @param ctx
     * @param from
     * @param to
     */
    public static drawLine(ctx: CanvasRenderingContext2D, from: Point, to: Point) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.lineJoin = "round";
        ctx.closePath();
        ctx.stroke();
    }
}

export class Point {
    constructor(readonly x: number, readonly  y: number) {
    }
}