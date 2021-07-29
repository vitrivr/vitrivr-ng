import {Query} from './query-query.interface';
import {BooleanLookupQuery} from '../../queries/boolean-lookupquery.model';

/**
 * General interface of a BooleanLookupMessage
 */
export interface BooleanLookupInterface extends Query {
    boolQueries: BooleanLookupQuery[]
}
