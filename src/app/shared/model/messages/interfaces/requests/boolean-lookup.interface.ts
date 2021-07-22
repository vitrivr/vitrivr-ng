import {Query} from './query-query.interface';

/**
 * General interface of a MetadataLookupMessage
 */
export interface BooleanLookupInterface extends Query {
    entity: string,
    attribute: string,
    value: string
}
