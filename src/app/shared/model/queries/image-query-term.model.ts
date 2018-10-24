import {AbstractQueryTerm} from "./abstract-query-term.model";
export class ImageQueryTerm extends AbstractQueryTerm {
    /* The raw image as Base64 encoded string. */
    public data: string;

    /**
     * Default constructor.
     */
    constructor() {
        super("IMAGE", ['globalcolor', 'localcolor', 'quantized', 'edge'])
    }
}