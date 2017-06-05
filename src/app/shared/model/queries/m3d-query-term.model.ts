import {QueryTermInterface} from "./interfaces/query-term.interface";
import {QueryTermType} from "./interfaces/query-term-type.interface";


export class M3DQueryTerm implements QueryTermInterface {
    /** Base64 encoded 3d model data. */
    public data : string;

    /** The active categories for the findSimilar-term. */
    public categories : string[] = ['sphericalharmonicsdefault'];

    /** Type of findSimilar-term. Defaults to 'MODEL'. */
    public readonly type: QueryTermType = "MODEL3D";

    /**
     * Updates the feature-categories for this M3DQueryTerm based on a linear, numerical setting.
     *
     * @param setting Linear, numerical setting value.
     */
    setting(setting: number): void {
        switch (setting) {
            case 0:
                this.categories = ['sphericalharmonicslow'];
                break;
            case 1:
                this.categories = ['sphericalharmonicsdefault'];
                break;
            case 2:
                this.categories = ['sphericalharmonicshigh', 'lightfield'];
                break;
            case 100:
                this.categories = ['lightfield'];
                break;
            default:
                break;
        }
    }
}