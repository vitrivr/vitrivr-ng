import {MessageType} from '../message-type.model';
import {StagedSimilarityQuery} from './staged-similarity-query.model';
import {TemporalQueryMessage} from '../interfaces/requests/temporal-query.interface';
import {MetadataAccessSpecification} from './metadata-access-specification.model';
import {TemporalQueryConfig} from '../interfaces/requests/temporal-query-config.interface';

export class TemporalQuery implements TemporalQueryMessage {
  public readonly messageType: MessageType = 'Q_TEMPORAL';

  constructor(public readonly queries: StagedSimilarityQuery[], public readonly config: TemporalQueryConfig = null, public readonly metadataAccessSpec: MetadataAccessSpecification[]) {
  }
}
