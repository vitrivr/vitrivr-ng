import {QueryTermInterface} from "./interfaces/query-term.interface";
import {QueryTermType} from "./interfaces/query-term-type.interface";
export class MotionQueryTerm implements QueryTermInterface {
    /** JSON data capturing the motion. */
    public data : string;

    /** The active categories for the findSimilar-term. */
    public categories : string[] = ['motion'];

    /** Type of findSimilar-term. Defaults to 'MODEL'. */
    public readonly type: QueryTermType = "MOTION";

    /**
     * Updates the feature-categories for this MotionQueryTerm based on a linear, numerical setting.
     *
     * @param setting Linear, numerical setting value.
     */
    setting(setting: number): void {
        this.categories = ['motion'];
    }
}