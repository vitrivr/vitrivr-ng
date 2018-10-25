import {AbstractQueryTerm} from "./abstract-query-term.model";
export class ImageQueryTerm extends AbstractQueryTerm {
    /**
     * Default constructor.
     */
    constructor() {
        super("IMAGE", ['globalcolor', 'localcolor', 'quantized', 'edge'])
    }
}