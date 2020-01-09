import {QueryResult} from './query-result.interface';
import {MediaSegment} from '../../../media/media-segment.model';

/**
 *
 */
export interface SegmentQueryResult extends QueryResult {
  content: MediaSegment[],
}
