import {Point} from './point.model';


/**
 * Implemented by any object that can be drawn in a Canvas. Implements two methods:
 *
 * <ul>
 *     <li><strong>draw</strong> Drawing logic for the Drawable object.
 *     <li><strong>append</strong> Appends a point to the drawable (if supported).
 * </ul>
 */
export interface Drawable {
  /**
   * Draws the drawable object.
   *
   * @param ctx Context used to draw the arrow object.
   */
  draw(ctx: CanvasRenderingContext2D);

  /**
   * Appends a point to the drawable object. Returns true if point
   * was appended and false otherwise.
   *
   * @param p
   * @return Returns true, if point was appended and false otherwise.
   */
  append(p: Point): boolean;
}
