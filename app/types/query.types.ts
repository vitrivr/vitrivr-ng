import {MediaType} from "./media.types";
import {QueryMessage, MessageType} from "./messages.types";
/**
 *
 */
export interface QueryInterface extends QueryMessage {
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

export class Query implements QueryInterface {
    messagetype : MessageType = "Q_QUERY";
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
            case 4:
                this.categories = ['globalcolor', 'localcolor', 'edge', 'poi'];
                break;
            default:
                this.categories = ['globalcolor'];
                break;
        }
    }

}

export class QueryContainer implements QueryContainerInterface {
    public imageQueryTerm : ImageQueryTerm;
}