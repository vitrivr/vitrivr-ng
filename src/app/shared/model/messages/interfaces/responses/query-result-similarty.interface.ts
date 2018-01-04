import {Similarity} from "../../../media/similarity.model";
import {QueryResult} from "./query-result.interface";
/**
 * QueryResult message.interface.ts: Defines the general structure of a QueryResult.
 */
export interface SimilarityQueryResult extends QueryResult {
    category : string;
    content : Similarity[],
}
