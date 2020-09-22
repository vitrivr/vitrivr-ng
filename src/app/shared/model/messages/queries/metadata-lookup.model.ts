import {MessageType} from '../message-type.model';
import {MetadataLookupMessage} from '../interfaces/requests/metadata-lookup.interface';
import {QueryConfig} from '../interfaces/requests/query-config.interface';

export class MetadataLookup implements MetadataLookupMessage {
  readonly messageType: MessageType = 'M_LOOKUP';
  readonly config: QueryConfig = null;

  /** Object IDs for which to lookup metadata. */
  readonly objectids: string[] = [];

  /** Domains to include in the lookup. If empty, all domains will be considered.
   *
   * (Not supported yet as of 2017-02-13)
   *
   * @type {Array}
   */
  readonly domains: string[] = [];

  /**
   *
   * @param objectids
   */
  constructor(...objectids: string[]) {
    this.objectids = objectids;
  }
}
