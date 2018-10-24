import {AbstractQueryTerm} from "./abstract-query-term.model";
export class M3DQueryTerm extends AbstractQueryTerm {
    /* The 3D model as Base64 encoded string. */
    public data: string;

    /**
     * Default constructor.
     */
    constructor() {
        super("MODEL3D", ['sphericalharmonicsdefault'])
    }
}