import {AbstractQueryTerm} from "../abstract-query-term.model";
import {SemanticCategory} from "./semantic-category.model";
export class SemanticQueryTerm extends AbstractQueryTerm {

    /** The image data associated with this SemanticQueryTerm. */
    public data: string;

    /** The category to color map. */
    public map: SemanticCategory[] = [];

    /**
     * Default constructor.
     */
    constructor() {
        super("SEMANTIC",  ['semantic']);
    }
}