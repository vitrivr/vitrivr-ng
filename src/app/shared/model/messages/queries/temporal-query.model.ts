import {MessageType} from '../message-type.model';
import {TemporalQueryMessage} from '../interfaces/requests/temporal-query.interface';
import {QueryConfig} from '../interfaces/requests/query-config.interface';
import {StagedSimilarityQuery} from './staged-similarity-query.model';
import {QueryContainerInterface} from '../../queries/interfaces/query-container.interface';

export class TemporalQuery implements TemporalQueryMessage {
  public readonly messageType: MessageType = 'Q_TEMPORAL';

  constructor(public readonly queries: StagedSimilarityQuery[], public readonly config: QueryConfig = null) {
  }
}
