import {QueryContainerInterface} from "./interfaces/query-container.interface";

import {ImageQueryTerm} from "./image-query-term.model";
import {AudioQueryTerm} from "./audio-query-term.model";

export class QueryContainer implements QueryContainerInterface {
    /** */
    public imageQueryTerm : ImageQueryTerm = null;

    /** */
    public audioQueryTerm : AudioQueryTerm = null;
}