import {MessageType} from '../message-type.model';
import {QueryConfig} from '../interfaces/requests/query-config.interface';
import {StagedSimilarityQuery} from './staged-similarity-query.model';
import {TemporalQueryMessage} from '../interfaces/requests/temporal-query.interface';

export class TemporalQuery implements TemporalQueryMessage {
  public readonly messageType: MessageType = 'Q_TEMPORAL';

  constructor(public readonly queries: StagedSimilarityQuery[], public readonly config: QueryConfig = null, public readonly timeDistances: number[] = [], public readonly maxLength: number = -1) {
  }
}
