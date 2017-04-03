import {QueryTermInterface, QueryTermType} from "./interfaces/query-term.interface";


export class M3DQueryTerm implements QueryTermInterface {
    /** Base64 encoded 3d model data. */
    public data : string;

    /** The active categories for the query-term. */
    public categories : string[] = ['sphericalharmonics', 'lightfield'];

    /** Type of query-term. Defaults to 'MODEL'. */
    public readonly type: QueryTermType = "MODEL";

    /** */
    setting(setting: number): void {

    }
}