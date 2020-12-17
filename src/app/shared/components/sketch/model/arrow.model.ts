import {Line} from './line.model';
import {Point} from './point.model';

export class Arrow extends Line {
  /**
   *
   * @param p
   * @param _color
   * @param _linesize
   * @param _threshold
   * @param _startArrowhead
   * @param _endArrowhead
   */
  constructor(p: Point, _color: string = '#000000', _linesize: number = 5, _threshold: number = 5, private _startArrowhead = false, private _endArrowhead = true) {
    super(p, _color, _linesize, _threshold);
    this.append(p);
  }

  /**
   * Getter for startArrowhead.
   *
   * @return {boolean}
   */
  get startArrowhead(): boolean {
    return this._startArrowhead;
  }

  /**
   * Setter for startArrowhead.
   *
   * @param value
   */
  set startArrowhead(value: boolean) {
    this._startArrowhead = value;
  }

  /**
   * Getter for endArrowhead.
   *
   * @return {boolean}
   */
  get endArrowhead(): boolean {
    return this._endArrowhead;
  }

  /**
   * Draws the arrow object.
   *
   * @param ctx Context used to draw the arrow object.
   */
  public draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    if (this.points.length > 1) {
      let first = this.points[0];
      let second = this.points[1];

      if (this.startArrowhead) {
        this.drawArrowhead(ctx, first, second);
      }

      for (let i = 0; i < this.points.length - 1; i++) {
        first = this.points[i];
        second = this.points[i + 1];
        Point.drawLine(ctx, first, second);
      }

      if (this.endArrowhead) {
        this.drawArrowhead(ctx, first, second);
      }
    }
  }

  /**
   * Draws the arrowheads according to the specification.
   *
   * @param ctx Context used to draw the arrow object.
   * @param p1 The first point used to determine the arrowhead's direction.
   * @param p2 The second point used to determine the arrowhead's direction.
   */
  public drawArrowhead(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, ) {
    const h = 12;
    const sa = Math.sin(Math.PI / 8);
    const ca = Math.cos(Math.PI / 8);
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.translate(p2.x, p2.y);
    ctx.scale(h, h);
    ctx.rotate(-Math.atan2(p2.x - p1.x, p2.y - p1.y));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(+sa, -ca);
    ctx.moveTo(0, 0);
    ctx.lineTo(-sa, -ca);
    ctx.quadraticCurveTo(0, -ca * (2 / 3), sa, -ca);
    ctx.fill();
    ctx.restore();
  }
}
