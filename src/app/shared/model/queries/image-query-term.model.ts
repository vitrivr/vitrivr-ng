import {QueryTermInterface} from "./interfaces/query-term.interface";
import {QueryTermType} from "./interfaces/query-term-type.interface";


export class ImageQueryTerm implements QueryTermInterface {

    /** Base64 encoded image data. */
    public data : string;

    /** The active categories for the findSimilar-term. */
    public categories : string[] = ['globalcolor', 'localcolor'];


    /** Type of findSimilar-term. Defaults to 'IMAGE'. */
    public readonly type: QueryTermType = "IMAGE";

    /**
     * Updates the feature-categories for this ImageQueryTerm based on a linear, numerical setting.
     *
     * @param setting Linear, numerical setting value.
     */
    public setting(setting : number) {
        switch (setting) {
            case 0:
                this.categories = ['globalcolor', 'quantized'];
                break;
            case 1:
                this.categories = ['globalcolor', 'localcolor'];
                break;
            case 2:
                this.categories = ['globalcolor', 'localcolor', 'edge'];
                break;
            case 3:
                this.categories = ['globalcolor', 'localcolor', 'localfeatures', 'edge'];
                break;
            case 4:
                this.categories = ['localcolor', 'localfeatures'];
                break;
            case 100:
                this.categories = ['lightfield'];
                break;
            default:
                this.categories = ['globalcolor', 'localcolor'];
                break;
        }
    }
}