import {MessageType} from '../message-type.model';
import {SkelLookupMessage} from '../interfaces/requests/skel-lookup.interface';
import {QueryConfig} from '../interfaces/requests/query-config.interface';

export class SkelLookup implements SkelLookupMessage {
  public readonly messageType: MessageType = 'S_LOOKUP';
  readonly config: QueryConfig = null;

  constructor(public readonly img: string) {}
}
