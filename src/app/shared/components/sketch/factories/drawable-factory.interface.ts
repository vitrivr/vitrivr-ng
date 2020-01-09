import {Drawable} from '../model/drawable.interface';


/**
 * Classes that implement this interface act as factory for the respective Drawable implementation. They
 * can be used to configure the respective drawable.
 */
export interface DrawableFactory<T extends Drawable> {

  /**
   * Returns a new Drawable with a start position specified by the x and y coordinate.
   * @param x Coordinate of the Drawable's start position.
   * @param y Coordinate of the Drawable's end position.
   */
  next(x: number, y: number): T;
}
