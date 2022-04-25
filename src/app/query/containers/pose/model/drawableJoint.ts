import Two from 'two.js';
import {Joint} from '../pose-query.interface';

/**
 * Internal class that acts both as {@link Anchor} and {@link Joint}
 */
export class DrawableJoint extends Two.Circle implements Joint {

  /** Flag indicating that this {@link DrawableJoint} has been disabled. */
  private _disable = false;

  /** Flag indicating that this {@link DrawableJoint} has been disabled. */
  private _hover = false;

  /**
   * Constructor for {@link DrawableJoint}.
   *
   * @param x coordinate of {@link DrawableJoint}.
   * @param y coordinate of {@link DrawableJoint}.
   * @param visualize Flag indicating, whether joint should be visualized.
   */
  constructor(x: number, y: number, visualize: boolean = true) {
    super();
    this.position = new Two.Anchor(x + this.radius / 2, y + this.radius / 2, 0, 0, 0, 0, Two.Commands.line)
    if (visualize) {
      this.radius = 6
      this.fill = '#00AEFF'
      this.stroke = '#00AEFF'
    }
  }

  /**
   * Getter for this {@link _disable}
   */
  get disable() {
    return this._disable
  }

  /**
   * Setter  for this {@link _disable}.
   *
   * Updates colour of circle based on status.
   *
   * @param value
   */
  set disable(value: boolean) {
    if (value) {
      this.fill = '#AAAAAA'
      this.stroke = '#AAAAAA'
    } else {
      this.fill = '#00AEFF'
      this.stroke = '#00AEFF'
    }
    this._disable = value
  }

  /**
   * Getter for this {@link _hover}
   */
  get hover() {
    return this._hover
  }

  /**
   * Setter  for this {@link _hover}.
   *
   * Updates colour of circle based on status.
   *
   * @param value
   */
  set hover(value: boolean) {
    if (value) {
      this.fill = '#FF69B4'
    } else if (this._disable) {
      this.fill = '#AAAAAA'
    } else {
      this.fill = '#00AEFF'
    }
    this._hover = value
  }

  get x(): number {
    return this.position.x
  }

  get y(): number {
    return this.position.y
  }
}
