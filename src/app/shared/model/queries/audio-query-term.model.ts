import {QueryTermInterface, QueryTermType} from "./interfaces/query-term.interface";

export class AudioQueryTerm implements QueryTermInterface {
    /** Base64 encoded audio data. */
    public data: string;

    /** Array with the active feature categories. */
    public categories : string[] = ['audiobassline', 'audiomelody', 'audiofingerprint'];

    /** Type of query-term. Defaults to 'Audio'. */
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
                this.categories = ['audiobassline', 'audiomelody', 'audiofingerprint'];
                break;
            case 2:
                this.categories = ['audiobassline', 'audiomelody', 'mfcc'];
                break;
            case 3:
                this.categories = ['audiobassline', 'audiomelody'];
                break;
            default:
                this.categories = ['audiobassline', 'audiomelody', 'audiofingerprint'];
                break;
        }
    }
}