import {Point} from "./point.model";
import {Drawable} from "./drawable.interface";

export class Line implements Drawable {
    /** List of points that make up this line. */
    private _points: Point[] = [];

    /**
     * Constructor for a line object.
     *
     * @param p Start point of the line.
     * @param _color Colour of the line.
     * @param _linesize Size (thickness) of the line.
     * @param _threshold Minimum distance between a new point and the last point in the line.
     */
    constructor(p: Point, private _color: string = "#000000", private _linesize: number = 5, private _threshold: number = 5) {
        this.append(p);
    }

    /**
     * Getter for the list of points in the line.
     *
     * @return {Point[]}
     */
    get points(): Point[] {
        return this._points;
    }

    /**
     * Getter for the current line colour.
     *
     * @return {string}
     */
    get color(): string {
        return this._color;
    }

    /**
     * Setter for the current line colour.
     *
     * @param c New line colour.
     */
    set color(c: string) {
        this._color = c;
    }

    /**
     * Appends a point to the line if the last point in the line is not equal to
     * the newly provided one.
     *
     * @param p Point that should be added.
     * @return {boolean} True if point was added, false otherwise.
     */
    public append(p: Point) : boolean {
        if (this.points.length > 0) {
            let last = this._points[this._points.length - 1];
            if (this._threshold > 0 && last.distance(p) < this._threshold) return false;
        }
        this._points.push(p);
        return true;
    }

    /**
     * Clears the line by removing all points.
     */
    public clear() {
        this._points = [];
    }

    /**
     * Draws a line object.
     *
     * @param ctx Context used to draw the line.
     * @param line The Line object that should be drawn.
     */
    public draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this._linesize;
        ctx.lineJoin = "round";

        if (this.points.length > 1) {
            let first = this.points[0];
            let second = this.points[1];
            for (let i = 0; i<this.points.length-1; i++) {
                first = this.points[i];
                second = this.points[i+1];
                ctx.beginPath();
                ctx.moveTo(first.x, first.y);
                ctx.lineTo(second.x, second.y);
                ctx.closePath();
                ctx.stroke();
            }
        }
    }
}