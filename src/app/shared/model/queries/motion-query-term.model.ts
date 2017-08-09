import {AbstractQueryTerm} from "./abstract-query-term.model";
export class MotionQueryTerm extends AbstractQueryTerm {
    /**
     * Default constructor.
     */
    constructor() {
        super("MOTION",  ['motion']);
    }
}