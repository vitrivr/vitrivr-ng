import {QueryResult} from './query-result.interface';
import {Tag} from '../../../misc/tag.model';
import {TagOcurrenceModel} from '../../../misc/tagOcurrence.model';

/**
 * QueryTopCaptions message.interface.ts: Defines the general structure of QueryTopCaptions.
 */
export interface QueryResultTopCaptions extends QueryResult {
  captions: Map<string, number>,
  queryId: string;

}


