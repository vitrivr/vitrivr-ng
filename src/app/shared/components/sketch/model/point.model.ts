import {Drawable} from './drawable.interface';

export class Point implements Drawable {
  constructor(readonly x: number, readonly  y: number) {
  }

  /**
   *
   * @param ctx
   * @param p
   */
  public static drawCircle(ctx: CanvasRenderingContext2D, p: Point) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, 2 * Math.PI);
    ctx.lineJoin = 'round';
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
    ctx.lineJoin = 'round';
    ctx.closePath();
    ctx.stroke();
  }

  /**
   * Returns the distance between this point and another point.
   *
   * @param p Point to measure the distance from.
   */
  public distance(p: Point): number {
    return Math.sqrt(Math.pow((p.x - this.x), 2) + Math.pow((p.y - this.y), 2));
  }

  /**
   * Draws the point using the given settings.
   *
   * @param ctx
   */
  public draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, ctx.lineWidth / 2, 0, 2 * Math.PI);
    ctx.lineJoin = 'round';
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Returns always false.
   *
   * @param p
   * @return {boolean}
   */
  public append(p: Point): boolean {
    return false;
  }
}
