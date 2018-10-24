import {AbstractQueryTerm} from "./abstract-query-term.model";
export class AudioQueryTerm extends AbstractQueryTerm {
    /* The raw audio data as Base64 encoded string. */
    public data: string;

    /**
     * Default constructor.
     */
    constructor() {
        super("AUDIO", ['audiofingerprint', 'audiomatching'])
    }
}