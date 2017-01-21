import {Component, ViewChild, HostListener, Input} from '@angular/core';

@Component({
    selector: 'sketch-canvas',
    template:`<canvas #sketch width='{{width}}' height='{{height}}' style="border: solid 1px;" ></canvas>`
})

export class SketchCanvas  {
    @ViewChild('sketch') private canvas: any;

    @Input() width: number = 400;
    @Input() height: number = 400;

    private context: CanvasRenderingContext2D;
    private paint = false;
    private last: Point = null;
    private current: Point = null;

    ngAfterViewInit() {
        let canvas = this.canvas.nativeElement;
        this.context = canvas.getContext("2d");
        this.context.lineJoin = "round"
    }

    @HostListener('mousedown', ['$event'])
    onMousedown(event: MouseEvent) {
        this.paint = true;
        this.current = new Point(event.x - this.canvas.nativeElement.offsetLeft, event.y - this.canvas.nativeElement.offsetTop);
        SketchCanvas.drawCircle(this.context, this.current);
        this.last = this.current;
    };

    @HostListener('mouseup', ['$event'])
    onMouseup(event: MouseEvent) {
        this.paint = false;
    };

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent) {
        this.paint = false;
    };

    @HostListener('mousemove', ['$event'])
    onMousemove(event: MouseEvent) {
        if(this.paint && event.target == this.canvas.nativeElement) {
            this.current = new Point(event.x - this.canvas.nativeElement.offsetLeft, event.y  - this.canvas.nativeElement.offsetTop);
            if (this.last !== null) {
                SketchCanvas.drawLine(this.context, this.last, this.current);
            }
            this.last = this.current;
        }
    };

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
     *
     * @returns {ImageData}
     */
    public getImage() {
        return this.context.getImageData(0,0,this.width, this.height);
    }

    /**
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
     *
     * @param ctx
     * @param p
     */
    public static drawCircle(ctx: CanvasRenderingContext2D, p: Point) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, 2 * Math.PI);
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
        ctx.closePath();
        ctx.stroke();
    }
}

export class Point {
    constructor(readonly x: number, readonly  y: number) {
    }
}