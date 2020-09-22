import {Query} from './query-query.interface';

export interface SegmentQueryMessage extends Query {
  /** ID of the segment that should be taken as reference. */
  segmentId: string;
}
