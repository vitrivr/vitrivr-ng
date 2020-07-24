import {Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {Point} from './model/point.model';
import {Line} from './model/line.model';
import {DrawableFactory} from './factories/drawable-factory.interface';
import {LineFactory} from './factories/line-factory.model';
import {Drawable} from './model/drawable.interface';

@Component({
  selector: 'motion-sketch-canvas',
  template: `
    <canvas #sketch width='{{width}}' height='{{height}}' style="border: solid 1px;" (mousedown)="onMousedown($event)" (mouseup)="onMouseup($event)" (mouseleave)="onMouseLeave($event)"
            (mousemove)="onMousemove($event)"></canvas>`
})
export class TrackingSketchCanvasComponent implements OnInit {
  /** Width of the TrackingSketchCanvasComponent. */
  @Input() public width: number = 400;
  /** Height of the TrackingSketchCanvasComponent. */
  @Input() public height: number = 400;
  /** Reference to the native canvas element. */
  @ViewChild('sketch', {static: false}) private canvas: ElementRef;
  /** The drawing context used by this canvas. */
  private context: CanvasRenderingContext2D;

  /** Boolean indicating if the user is currently drawing. */
  private drawing: boolean = false;

  /** A list of lines held by the current instance of TrackingSketchCanvasComponent. */
  private _drawables: Drawable[] = [];

  /**
   * Getter for the individual lines.
   *
   * @return {Line[]}
   */
  get drawables(): Drawable[] {
    return this._drawables;
  }

  /** The factory class used to create new drawables. */
  private _factory: DrawableFactory<Drawable> = new LineFactory();

  /**
   * Getter for DrawableFactory
   *
   * @return {DrawableFactory}
   */
  get factory(): DrawableFactory<Drawable> {
    return this._factory;
  }

  /**
   * Setter for DrawableFactory.
   *
   * @param value
   */
  set factory(value: DrawableFactory<Drawable>) {
    if (value) {
      this._factory = value;
    }
  }

  /**
   * Lifecycle Hook (onInit): Initialises the drawing context.
   */
  public ngOnInit() {
    let canvas = this.canvas.nativeElement;
    this.context = canvas.getContext('2d');
  }

  /**
   * Called whenever a mouse-button is pressed or the user starts tapping: Creates
   * a new line and starts drawing.
   *
   * @param event
   */
  public onMousedown(event: MouseEvent) {
    this.drawing = true;
    let drawable: Drawable = this._factory.next(event.offsetX, event.offsetY);
    this._drawables.push(drawable);
    this.redraw();
  };

  /**
   * Called whenever a mouse is moved within the canvas: If the user is drawing, a new
   * point is appended to the current line.
   *
   * @param event
   */
  public onMousemove(event: MouseEvent) {
    if (this.drawing && event.target == this.canvas.nativeElement && this._drawables.length > 0) {
      let current: Drawable = this._drawables[this._drawables.length - 1];
      if (current.append(new Point(event.offsetX, event.offsetY))) {
        this.redraw();
      }
    }
  };

  /**
   * Called whenever a mouse-button is goes up: Ends the drawing mode.
   *
   * @param event
   */
  public onMouseup(event: MouseEvent) {
    this.drawing = false;
  };

  /**
   * Called whenever a mouse leaves: Ends the drawing mode.
   *
   * @param event
   */
  public onMouseLeave(event: MouseEvent) {
    this.drawing = false;
  };

  /**
   *
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  public onResize(event: any) {
    event.target.innerWidth;
  }

  /**
   * Clears the canvas; both the drawings and the background.
   */
  public clear() {
    this._drawables = [];
    this.redraw();
  }

  /**
   * Redraws the canvas based on the stored lines.
   */
  public redraw() {
    this.context.clearRect(0, 0, this.width, this.height);
    for (let line of this._drawables) {
      line.draw(this.context);
    }
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
    let image = new Image();
    image.src = data;
    image.onload = () => {
      this.context.drawImage(image, 0, 0, this.context.canvas.width, this.context.canvas.height);
    }
  }
}
