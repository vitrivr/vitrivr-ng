import {MoreLikeThisQueryMessage} from '../interfaces/requests/more-like-this-query.interface';
import {MessageType} from '../message-type.model';
import {QueryConfig} from '../interfaces/requests/query-config.interface';
import {MetadataAccessSpecification} from './metadata-access-specification.model';

export class MoreLikeThisQuery implements MoreLikeThisQueryMessage {
  public readonly messageType: MessageType = 'Q_MLT';

  public constructor(public readonly segmentId: string, public readonly categories: string[], public readonly config: QueryConfig = null, public readonly metadataAccessSpec: MetadataAccessSpecification[] = null) {
  }
}
