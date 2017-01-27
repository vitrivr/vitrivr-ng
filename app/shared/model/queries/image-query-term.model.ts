import {QueryTermInterface, QueryTermType} from "./interfaces/query-term.interface";


export class ImageQueryTerm implements QueryTermInterface {

    /** Base64 encoded image data. */
    public data : string;

    /** The active categories for the query-term. */
    public categories : string[] = ['globalcolor', 'localcolor'];

    public readonly type: QueryTermType = "IMAGE";

    /**
     *
     * @param setting
     */
    public setting(setting : number) {
        switch (setting) {
            case 0:
                this.categories = ['globalcolor'];
                break;
            case 1:
                this.categories = ['globalcolor', 'localcolor'];
                break;
            case 2:
                this.categories = ['globalcolor', 'localcolor', 'quantized'];
                break;
            case 3:
                this.categories = ['globalcolor', 'localcolor', 'quantized', 'edge'];
                break;
            case 4:
                this.categories = ['globalcolor', 'localcolor', 'quantized', 'localfeatures', 'edge'];
                break;
            default:
                this.categories = ['globalcolor', 'localcolor'];
                break;
        }
    }
}