import {Arrow} from "../../../../shared/components/sketch/model/arrow.model";
import {MotionType} from "./motion-type.model";
import {Point} from "../../../../shared/components/sketch/model/point.model";

export class MotionArrow extends Arrow {
    /**
     *
     * @param p
     * @param _color
     * @param _linesize
     * @param _threshold
     * @param _startArrowhead
     * @param _endArrowhead
     */
    constructor(p: Point, _color: string = "#000000", _linesize: number = 5, _threshold: number = 5, _startArrowhead = false, _endArrowhead = true, private _type: MotionType) {
        super(p, _color, _linesize, _threshold);
        this.append(p);
    }

    /**
     * Getter for MotionType.
     *
     * @return {MotionType}
     */
    get type(): MotionType {
        return this._type;
    }
}
