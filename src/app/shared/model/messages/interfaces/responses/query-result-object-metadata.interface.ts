import {QueryResult} from './query-result.interface';
import {MediaObjectMetadataDescriptor} from '../../../../../../../openapi/cineast';

export interface ObjectMetadataQueryResult extends QueryResult {
  content: MediaObjectMetadataDescriptor[],
}
