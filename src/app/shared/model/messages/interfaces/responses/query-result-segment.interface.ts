import {QueryResult} from './query-result.interface';
import {MediaSegmentDescriptor} from '../../../../../../../openapi/cineast';

/**
 *
 */
export interface SegmentQueryResult extends QueryResult {
  content: MediaSegmentDescriptor[],
}
