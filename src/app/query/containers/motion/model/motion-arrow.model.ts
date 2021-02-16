import {Arrow} from '../../../../shared/components/sketch/model/arrow.model';
import {MotionType} from './motion-type.model';
import {Point} from '../../../../shared/components/sketch/model/point.model';

export class MotionArrow extends Arrow {

  constructor(p: Point, _color: string = '#000000', _linesize: number = 5, _threshold: number = 4, _startArrowhead = false, _endArrowhead = true, private _type: MotionType) {
    super(p, _color, _linesize, _threshold, _startArrowhead, _endArrowhead);
    this.append(p);
  }

  get type(): MotionType {
    return this._type;
  }
}
