import {AbstractQueryTerm} from "./abstract-query-term.model";
export class MotionQueryTerm extends AbstractQueryTerm {
    /** The motion encoded as Base64 encoded string. */
    public data: string;

    /**
     * Default constructor.
     */
    constructor() {
        super("MOTION",  ['motion']);
    }
}