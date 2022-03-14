import {NeighboringSegmentQueryMessage} from '../interfaces/requests/neighboring-segment-query.interface';
import {MessageType} from '../message-type.model';
import {QueryConfig} from '../interfaces/requests/query-config.interface';
import {MetadataAccessSpecification} from './metadata-access-specification.model';

export class NeighboringSegmentQuery implements NeighboringSegmentQueryMessage {
  public readonly messageType: MessageType = 'Q_NESEG';

  constructor(public readonly segmentId: string, public readonly config: QueryConfig, public readonly count: number = 3, public readonly metadataAccessSpec: MetadataAccessSpecification[] = null) {
  }
}
