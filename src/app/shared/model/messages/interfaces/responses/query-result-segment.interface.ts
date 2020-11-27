import {QueryResult} from './query-result.interface';
import {MediaSegment} from '../../../media/media-segment.model';

/**
 *
 */
export interface MediaSegmentQueryResult extends QueryResult {
  content: MediaSegment[],
}
