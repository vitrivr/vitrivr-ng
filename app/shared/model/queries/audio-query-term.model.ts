import {QueryTermInterface, QueryTermType} from "./interfaces/query-term.interface";


export class AudioQueryTerm implements QueryTermInterface {
    /** Base64 encoded audio data. */
    public data: string;

    /**
     *
     * @type {Array}
     */
    public categories : string[] = [];

    /**
     *
     * @type {string}
     */
    public readonly type: QueryTermType = "AUDIO";

    /**
     *
     * @param setting
     */
    public setting(setting : number) {

    }
}