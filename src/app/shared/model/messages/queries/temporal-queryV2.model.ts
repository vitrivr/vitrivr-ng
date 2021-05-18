import {MessageType} from '../message-type.model';
import {QueryConfig} from '../interfaces/requests/query-config.interface';
import {StagedSimilarityQuery} from './staged-similarity-query.model';
import {TemporalQueryMessageV2} from '../interfaces/requests/temporal-queryV2.interface';

export class TemporalQueryV2 implements TemporalQueryMessageV2 {
  public readonly messageType: MessageType = 'Q_TEMPORALV2';

  constructor(public readonly queries: StagedSimilarityQuery[], public readonly config: QueryConfig = null, public readonly timeDistances: number[] = [], public readonly maxLength: number = -1) {
  }
}
