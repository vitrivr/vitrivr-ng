import {MediaType} from "./media.types";
/**
 *
 */
export interface QueryInterface {
    containers : QueryContainerInterface[];
    types: MediaType[]
}

/**
 *
 */
export interface QueryContainerInterface {
    imageQueryTerm :  ImageQueryTerm;
}

/**
 *
 */
export interface QueryTermInterface {
    weight : number;
    categories : string[];
    setting(setting : number) : void;
}

export class Query {
    containers : QueryContainerInterface[] = [];
    types : MediaType[] = [];
}

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
            default:
                this.categories = ['globalcolor', 'localcolor', 'edge'];
                break;
        }
    }

}

export class QueryContainer implements QueryContainerInterface {
    public imageQueryTerm : ImageQueryTerm;
}