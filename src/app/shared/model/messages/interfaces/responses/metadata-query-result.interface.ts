import {QueryResult} from './query-result.interface';
import {MediaObjectMetadataDescriptor} from '../../../../../../../openapi/cineast';

/**
 * Defines the general structure of a MetadataQueryResult.
 */
export interface MetadataQueryResult extends QueryResult {

  /* List of MediaObjectMetadata entries (may be empty). */
  content: MediaObjectMetadataDescriptor[],

  /* Number of entries in the result. */
  count: number
}
