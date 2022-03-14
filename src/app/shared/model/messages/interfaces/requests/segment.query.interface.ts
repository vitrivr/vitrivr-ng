import {Query} from './query-query.interface';
import {MetadataAccessSpecification} from '../../queries/metadata-access-specification.model';

export interface SegmentQueryMessage extends Query {
  /** ID of the segment that should be taken as reference. */
  segmentId: string;

  metadataAccessSpec: MetadataAccessSpecification[];
}
