import {Component, ViewChild, HostListener, Input} from '@angular/core';

@Component({
    selector: 'sketch',
    styles:  [`
        input[type='file'] {
            display:none;
        }
        .toolbar {
             border: solid 1px lightgrey;
             height: 50px;
        }
        .toolbar-item {
            margin-left:5px;
            margin-right:5px;
        }
        .palette {
            position: relative;
            display: inline-block;
        }
        .palette button {
            width: 25px;
            height: 25px
        }
        .palette:hover .palette-content {
            display: block;
        }
        .palette-content {
            display: none;
            position: absolute;
            background-color: #f9f9f9;
            min-width: 270px;
            max-width: 270px;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        }
        .palette-field {
            float:left;
            height: 25px;
            width: 25px;
            margin: 1px 1px 1px 1px;
        }
    `],
    templateUrl: './app/views/sketch/sketch.component.html'
})

export class SketchComponent  {
    @ViewChild('sketch')
    private canvas: any;
    private context: CanvasRenderingContext2D;

    @ViewChild('imageloader')
    private imageloader: any;

    @Input() width: number = 500;
    @Input() height: number = 500;

    private palette: Color[] = [
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
    private lineWidth: number = 1;
    private paint: boolean = false;
    private background: any;
    private activeColor: Color = this.palette[0];
    private clicks: Click[] = [];
    ngAfterViewInit() {
        let canvas = this.canvas.nativeElement;
        this.context = canvas.getContext("2d");
        if (this.context != undefined && this.background != undefined) {
            let image = new Image();
            let ctx = this.context;
            image.onload = function() {
                ctx.drawImage(image, 0, 0);
            };
            image.src = this.background;
        }
    }

    @HostListener('mousedown', ['$event'])
    onMousedown(event: MouseEvent) {
        if (event.target == this.canvas.nativeElement) {
            this.paint = true;
            this.clicks.push(new Click(event.x - this.canvas.nativeElement.offsetLeft, event.y - this.canvas.nativeElement.offsetTop, this.activeColor, this.lineWidth, false));
            this.redraw();
        }
    };

    @HostListener('mouseup', ['$event'])
    onMouseup(event: MouseEvent) {
        this.paint = false;
    };

    @HostListener('mouseleave', ['$event'])
    onMouseleave(event: MouseEvent) {
        this.paint = false;
    };

    @HostListener('mousemove', ['$event'])
    onMousemove(event: MouseEvent) {
        if(this.paint && event.target == this.canvas.nativeElement) {
            this.clicks.push(new Click(event.x - this.canvas.nativeElement.offsetLeft, event.y  - this.canvas.nativeElement.offsetTop, this.activeColor, this.lineWidth, true));
            this.redraw();
        }
    };

    @HostListener('change', ['$event'])
    onChange(event: any) {
        let URL = window.URL;
        this.setImageBase64(URL.createObjectURL(event.target.files[0]))
    };

    public clearCanvas() {
        this.clicks = [];
        this.background = null;
        this.redraw();
    }

    public getImage() {
        return this.context.getImageData(0,0,this.width, this.height);
    }

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
        let t = this;
        this.background = new Image();
        this.background.src = data;
        this.background.onload = function() {t.redraw();}
    }

    public loadImage() {
        let imageloader = this.imageloader.nativeElement;
        imageloader.click();
    }

    public setColor(color : Color) {
        this.activeColor = color;
    }

    private redraw() {
        /* Clear the context. */
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.lineJoin = "round";

        /* First draw the background image. */
        if (this.background != undefined) {
            this.context.drawImage(this.background, 0, 0, this.context.canvas.width, this.context.canvas.height);
        }

        /* Then draw on top of it. */
        for(let i=0; i < this.clicks.length; i++) {
            this.context.beginPath();
            this.context.strokeStyle = this.clicks[i].color.value;
            this.context.lineWidth = this.clicks[i].line;
            if(this.clicks[i].dragging && i){
                this.context.moveTo(this.clicks[i-1].x, this.clicks[i-1].y);
            }else{
                this.context.moveTo(this.clicks[i].x-1, this.clicks[i].y);
            }
            this.context.lineTo(this.clicks[i].x, this.clicks[i].y);
            this.context.closePath();
            this.context.stroke();
        }
    }
}

export class Click {
    x: number;
    y: number;
    line: number;
    color: Color;
    dragging: boolean = false;

    constructor(x: number, y: number, color: Color, line: number, dragging: boolean) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.line = line;
        this.dragging = dragging;
    }
}

export class Color {
    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    };

    name: string;
    value: string;
}