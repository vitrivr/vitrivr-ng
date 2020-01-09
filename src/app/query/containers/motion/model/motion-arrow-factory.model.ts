import {DrawableFactory} from '../../../../shared/components/sketch/factories/drawable-factory.interface';
import {MotionArrow} from './motion-arrow.model';
import {Point} from '../../../../shared/components/sketch/model/point.model';
import {MotionType} from './motion-type.model';

export class MotionArrowFactory implements DrawableFactory<MotionArrow> {
  /** */
  private _type: MotionType;

  /**
   * Getter for MotionType.
   *
   * @return {MotionType}
   */
  get type(): MotionType {
    return this._type;
  }

  /**
   * Setter for MotionType.
   *
   * @param value
   */
  set type(value: MotionType) {
    this._type = value;
  }

  /**
   * Returns a new Arrow object starting at the given point using the factory settings.
   *
   * @param x Start position fo the Arrow
   * @param y Start position fo the Arrow
   * @return {Line}
   */
  public next(x: number, y: number): MotionArrow {
    let color = '#000000';
    if (this._type === 'FOREGROUND') {
      color = '#CD0000';
    } else if (this._type == 'BACKGROUND') {
      color = '#008000';
    }
    return new MotionArrow(new Point(x, y), color, 5, 4, false, true, this._type);
  }
}
