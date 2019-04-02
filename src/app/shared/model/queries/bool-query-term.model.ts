import {AbstractQueryTerm} from "./abstract-query-term.model";

export class BoolQueryTerm extends AbstractQueryTerm {

    /**
     * Default constructor. TODO Does this need anything else?
     */
    constructor() {
        super("TEXT", []);
    }
}