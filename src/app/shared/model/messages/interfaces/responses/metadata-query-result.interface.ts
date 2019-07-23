import {QueryResult} from "./query-result.interface";
import {MediaObjectMetadata} from "../../../media/media-object-metadata.model";

/**
 * Defines the general structure of a MetadataQueryResult.
 */
export interface MetadataQueryResult extends QueryResult {

    /* List of MediaObjectMetadata entries (may be empty). */
    content : MediaObjectMetadata[],

    /* Number of entries in the result. */
    count : number
}