import {AbstractQueryTerm} from "../abstract-query-term.model";
import {SemanticCategory} from "./semantic-category.model";
export class SemanticQueryTerm extends AbstractQueryTerm {
    /** The image data associated with this SemanticQueryTerm. */
    private _image: string;

    /** The category to color map. */
    private _map: SemanticCategory[] = [];

    /**
     * Default constructor.
     */
    constructor() {
        super("SEMANTIC",  ['semantic']);
    }

    /**
     * Getter for image.
     */
    get image(): string {
        return this._image;
    }

    /**
     * Setter for image.
     */
    set image(value: string) {
        this._image = value;
        this.refresh();
    }

    /**
     * Getter for map.
     */
    get map(): SemanticCategory[] {
        return this._map;
    }

    /**
     * Setter for map.
     */
    set map(value: SemanticCategory[]) {
        this._map = value;
        this.refresh();
    }

    /**
     * Generates the Base64 encoded data holding the category-map and the original image.
     */
    private refresh () {
        if (this._image && this._map) {
            this.data = "data:application/json;base64," + btoa(JSON.stringify({
                image : this.image,
                map : this.map.map(v => {
                    let obj = {};
                    obj[v.name] = v.color;
                    return obj;
                })
            }));
        }
    }
}