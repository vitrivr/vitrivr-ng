import {AbstractQueryTerm} from "./abstract-query-term.model";

export class TextQueryTerm extends AbstractQueryTerm {
    /** The text query encoded as Base64 encoded string. */
    public data: string;

    /**
     * Default constructor.
     */
    constructor() {
        super("TEXT", []);
    }
}