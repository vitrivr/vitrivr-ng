import {QueryTermInterface} from "./interfaces/query-term.interface";


export class ImageQueryTerm implements QueryTermInterface {
    public image : String;
    public weight : number;
    public categories : string[] = ['globalcolor'];

    setting(setting : number) {
        switch (setting) {
            case 0:
                this.categories = ['globalcolor'];
                break;
            case 1:
                this.categories = ['globalcolor', 'localcolor'];
                break;
            case 3:
                this.categories = ['globalcolor', 'localcolor', 'edge'];
                break;
            case 4:
                this.categories = ['poi'];
                break;
            default:
                this.categories = ['globalcolor'];
                break;
        }
    }
}