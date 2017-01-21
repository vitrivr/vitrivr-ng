import {ImageQueryTerm} from "./image-query-term.model";
import {QueryContainerInterface} from "./interfaces/query-container.interface";

export class QueryContainer implements QueryContainerInterface {
    public imageQueryTerm : ImageQueryTerm;
}