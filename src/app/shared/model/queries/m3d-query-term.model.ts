import {QueryTermInterface} from "./interfaces/query-term.interface";
import {QueryTermType} from "./interfaces/query-term-type.interface";


export class M3DQueryTerm implements QueryTermInterface {
    /** Base64 encoded 3d model data. */
    public data : string;

    /** The active categories for the findSimilar-term. */
    public categories : string[] = ['sphericalharmonics'];

    /** Type of findSimilar-term. Defaults to 'MODEL'. */
    public readonly type: QueryTermType = "MODEL3D";

    /** */
    setting(setting: number): void {

    }
}