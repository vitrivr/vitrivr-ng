import { MediaSegmentDescriptor } from 'app/core/openapi';
import {QueryResult} from './query-result.interface';

/**
 *
 */
export interface SegmentQueryResult extends QueryResult {
  content: MediaSegmentDescriptor[],
}
