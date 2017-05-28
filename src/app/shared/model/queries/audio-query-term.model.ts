import {QueryTermInterface} from "./interfaces/query-term.interface";
import {QueryTermType} from "./interfaces/query-term-type.interface";

export class AudioQueryTerm implements QueryTermInterface {
    /** Base64 encoded audio data. */
    public data: string;

    /** Array with the active feature categories. */
    public categories : string[] = ['audiofingerprint', 'audiomatching'];

    /** Type of findSimilar-term. Defaults to 'Audio'. */
    public readonly type: QueryTermType = "AUDIO";

    /**
     * Updates the feature-categories for this AudioQueryTerm based on a linear, numerical setting.
     *
     * @param setting Linear, numerical setting value.
     */
    public setting(setting : number) {
        switch (setting) {
            case 0:
                this.categories = ['audiofingerprint'];
                break;
            case 1:
                this.categories = ['audiofingerprint', 'audiomatching'];
                break;
            case 2:
                this.categories = ['audiomatching', 'hpcpaverage'];
                break;
            case 3:
                this.categories = ['audiomelody', 'pitchsequence'];
                break;
            case 4:
                this.categories = ['pitchsequence'];
                break;
            default:
                this.categories = ['audiofingerprint', 'audiomatching'];
                break;
        }
    }
}