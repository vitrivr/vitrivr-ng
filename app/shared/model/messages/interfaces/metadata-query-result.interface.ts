import {QueryResult} from "./query-result.interface";
import {MediaMetadata} from "../../media/media-metadata.model";

/**
 * Defines the general structure of a MetadataQueryResult.
 */
export interface MetadataQueryResult extends QueryResult {

    /* List of MediaMetadata entries (may be empty). */
    content : MediaMetadata[],

    /* Number of entries in the result. */
    count : number
}