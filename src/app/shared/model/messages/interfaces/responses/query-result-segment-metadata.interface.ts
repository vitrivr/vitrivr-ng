/**
 *
 */
import {QueryResult} from "./query-result.interface";
import {MediaSegmentMetadata} from "../../../media/media-segment-metadata.model";

export interface SegmentMetadataQueryResult extends QueryResult {
    content : MediaSegmentMetadata[],
}