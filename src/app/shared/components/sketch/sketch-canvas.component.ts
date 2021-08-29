import {Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {Point} from './model/point.model';

@Component({
  selector: 'app-sketch-canvas',
  template: `
      <canvas #sketch width='{{width}}' height='{{height}}' style="display: block; border: solid 1px; background-image: url(\'assets/images/transparent.png\')" (mousedown)="onMousedown($event)"
              (mouseup)="onMouseup($event)" (mouseleave)="onMouseLeave($event)" (mousemove)="onMousemove($event)" (drop)="onCanvasDropped($event)" (dragover)="onCanvasDragOver($event)"></canvas>`
})

export class SketchCanvasComponent implements OnInit {
  @Input() width = 400;
  @Input() height = 400;
  @ViewChild('sketch', {static: true}) private canvas: ElementRef;
  private context: CanvasRenderingContext2D;
  private paint = false;
  private last: Point = null;
  private current: Point = null;

  /**
   * Lifecycle Hook (onInit): Initialises the drawing context.
   */
  public ngOnInit() {
    const canvas = this.canvas.nativeElement;
    this.context = canvas.getContext('2d');
  }

  /**
   *
   * @param event
   */
  public onMousedown(event: MouseEvent) {
    this.paint = true;
    this.current = new Point(event.offsetX, event.offsetY);
    Point.drawCircle(this.context, this.current);
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
    if (this.paint && event.target === this.canvas.nativeElement) {
      this.current = new Point(event.offsetX, event.offsetY);
      if (this.last !== null) {
        Point.drawLine(this.context, this.last, this.current);
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
  onResize(event: any) {
    // tslint:disable-next-line:no-unused-expression
    event.target.innerWidth;
  }

  /**
   * Clears the canvas; both the drawings and the background.
   */
  public clearCanvas() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
  }

  /**
   * Getter for the rendered image data.
   *
   * @returns {ImageData}
   */
  public getImage() {
    return this.context.getImageData(0, 0, this.width, this.height);
  }

  /**
   * Getter for the base 64 encoded, rendered image data.
   *
   * @returns {string}
   */
  public getImageBase64() {
    return this.context.canvas.toDataURL('image/png');
  }

  /**
   * Sets the background-image of the sketch component based
   * on a based64 encoded data chunk.
   *
   * @param data
   */
  public setImageBase64(data: string) {
    const image = new Image();
    image.src = data;
    image.onload = function () {
      this.context.drawImage(image, 0, 0, this.context.canvas.width, this.context.canvas.height);
    }.bind(this);
  }

  /**
   * Sets the active color of the SketchPad.
   *
   * @param color Hex-color string.
   */
  public setActiveColor(color: string) {
    this.context.strokeStyle = color;
    this.context.fillStyle = color;
  }

  /**
   * Sets the linesize of the SketchPad.
   *
   * @param size New linesize
   */
  public setLineSize(size: number) {
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
}
