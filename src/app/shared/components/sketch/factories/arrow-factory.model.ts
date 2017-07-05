import {Point} from "../model/point.model";
import {Arrow} from "../model/arrow.model";
import {DrawableFactory} from "./drawable-factory.interface";
export class ArrowFactory implements DrawableFactory<Arrow> {
    /** Colour setting that should be used with new Lines. */
    private _color: string = "#000000";

    /** Linesize setting that should be used with new Lines. */
    private _linesize: number = 5;

    /** Threshold setting that should be used with new Lines. */
    private _threshold: number = 10;

    private _startArrowhead = false;

    private _endArrowhead = true;

    /**
     * Returns a new Arrow object starting at the given point using the factory settings.
     *
     * @param x Start position fo the Arrow
     * @param y Start position fo the Arrow
     * @return {Line}
     */
    public next(x: number, y: number): Arrow {
        return new Arrow(new Point(x,y), this._color, this._linesize, this._threshold, this._startArrowhead, this._endArrowhead);
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
     * Setter for endArrowhead.
     *
     * @param value
     */
    set endArrowhead(value: boolean) {
        this._endArrowhead = value;
    }
}