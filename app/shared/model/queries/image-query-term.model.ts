import {QueryTermInterface} from "./interfaces/query-term.interface";


export class ImageQueryTerm implements QueryTermInterface {
    public image : String;
    public weight : number;
    public categories : string[] = ['globalcolor', 'localcolor'];

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