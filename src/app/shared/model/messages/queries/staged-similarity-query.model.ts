import {MessageType} from '../message-type.model';
import {QueryContainerInterface} from '../../queries/interfaces/query-container.interface';
import {SimilarityQueryMessage} from '../interfaces/requests/similarity-query.interface';
import {QueryConfig} from '../interfaces/requests/query-config.interface';
import {SimilarityQuery} from './similarity-query.model';
import {QueryTermInterface} from '../../queries/interfaces/query-term.interface';

export class StagedSimilarityQuery {
  public readonly messageType: MessageType = 'Q_SSIM';

  constructor(public readonly containers: QueryContainerInterface[], public readonly config: QueryConfig = null) {
  }
}
