import {MessageType} from '../message-type.model';
import {QueryContainerInterface} from '../../queries/interfaces/query-container.interface';
import {SimilarityQueryMessage} from '../interfaces/requests/similarity-query.interface';
import {QueryConfig} from '../interfaces/requests/query-config.interface';

export class SimilarityQuery implements SimilarityQueryMessage {
  public readonly messageType: MessageType = 'Q_SIM';

  constructor(public readonly containers: QueryContainerInterface[], public readonly config: QueryConfig = null) {
  }
}
