import {Query} from './query-query.interface';

/**
 * General interface of a MetadataLookupMessage
 */
export interface MetadataLookupMessage extends Query {
  objectids: string[],
  domains: string[]
}
