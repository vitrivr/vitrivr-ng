import {AbstractQueryTerm} from "./abstract-query-term.model";

export class TagQueryTerm extends AbstractQueryTerm {

    /** The tag query encoded as Base64 encoded string. */
    public data: string;

    /**
     * Default constructor.
     */
    constructor() {
        super("TAG", ["tags"]);
    }
}