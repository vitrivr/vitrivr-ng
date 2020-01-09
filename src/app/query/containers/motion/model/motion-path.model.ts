import {Point} from "../../../../shared/components/sketch/model/point.model";
import {MotionType} from "./motion-type.model";
export interface MotionPath {
    type: MotionType;
    path: Point[];
}