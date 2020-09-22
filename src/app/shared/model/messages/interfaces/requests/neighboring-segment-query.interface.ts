import {Query} from './query-query.interface';

/**
 * Basic interfaces of a NeighboringSegmentQueryMessage. Upon reception, Cineast will lookup the segments neighbouring
 * the provided segment (if it exists) and return it.
 */
export interface NeighboringSegmentQueryMessage extends Query {
  /** ID of the segment that should be taken as reference. */
  segmentId: string;

  /** Number of neighbors to retrieve on each side. */
  count: number;
}
