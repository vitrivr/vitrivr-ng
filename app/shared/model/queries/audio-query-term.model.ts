import {QueryTermInterface} from "./interfaces/query-term.interface";


export class AudioQueryTerm implements QueryTermInterface {

    /** */
    public audio : String;
    public weight : number;
    public categories : string[] = [];

    /**
     *
     * @param setting
     */
    public setting(setting : number) {

    }
}