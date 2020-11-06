import { MediaObjectMetadataDescriptor } from 'app/core/openapi';
import {QueryResult} from './query-result.interface';

export interface ObjectMetadataQueryResult extends QueryResult {
  content: MediaObjectMetadataDescriptor[],
}
