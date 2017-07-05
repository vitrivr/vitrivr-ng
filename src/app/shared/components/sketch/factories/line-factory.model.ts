import {DrawableFactory} from "./drawable-factory.interface";
import {Line} from "../model/line.model";
import {Point} from "../model/point.model";
export class LineFactory implements DrawableFactory<Line> {
    /** Colour setting that should be used with new Lines. */
    private _color: string = "#000000";

    /** Linesize setting that should be used with new Lines. */
    private _linesize: number = 5;

    /** Threshold setting that should be used with new Lines. */
    private _threshold: number = 10;

    /**
     * Returns a new Line object starting at the given point using the factory settings.
     *
     * @param x Start position fo the Line
     * @param y Start position fo the Line
     * @return {Line}
     */
    public next(x: number, y: number): Line {
        return new Line(new Point(x,y), this._color, this._linesize, this._threshold);
    }

    /**
     * Getter for color.
     *
     * @return {string}
     */
    get color(): string {
        return this._color;
    }

    /**
     * Setter for color.
     *
     * @param value
     */
    set color(value: string) {
        this._color = value;
    }

    /**
     * Getter for linesize.
     *
     * @return {number}
     */
    get linesize(): number {
        return this._linesize;
    }

    /**
     * Setter for linesize.
     *
     * @param value
     */
    set linesize(value: number) {
        this._linesize = value;
    }

    /**
     * Getter for threshold.
     *
     * @return {number}
     */
    get threshold(): number {
        return this._threshold;
    }

    /**
     * Setter for threshold.
     *
     * @param value
     */
    set threshold(value: number) {
        this._threshold = value;
    }
}