import {ColorUtil} from "../../../util/color.util";

export class SemanticCategory {

    /**
     *
     */
    public readonly color;

    /**
     *
     * @param name
     * @param color
     */
    constructor(public readonly name, private _color?) {
        if (!_color) {
            _color = ColorUtil.randomColorHex();
        }
        this.color = _color;
    }

    /**
     *
     */
    public abbr(length: number) : string{
        return this.name.toUpperCase().substring(0,length)
    }
}