/**
 *
 */
import {QueryResult} from './query-result.interface';
import {MediaObjectMetadata} from '../../../media/media-object-metadata.model';

export interface ObjectMetadataQueryResult extends QueryResult {
  content: MediaObjectMetadata[],
}
