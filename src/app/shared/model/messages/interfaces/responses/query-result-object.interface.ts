import {QueryResult} from './query-result.interface';
import {MediaObjectDescriptor} from '../../../../../../../openapi/cineast';

/**
 *
 */
export interface ObjectQueryResult extends QueryResult {
  content: MediaObjectDescriptor[],
}
