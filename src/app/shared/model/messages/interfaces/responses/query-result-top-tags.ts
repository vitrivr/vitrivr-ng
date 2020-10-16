import {QueryResult} from './query-result.interface';
import {Tag} from '../../../misc/tag.model';
import {TagOcurrenceModel} from '../../../misc/tagOcurrence.model';

/**
 * QueryToptags message.interface.ts: Defines the general structure of QueryToptags.
 */
export interface QueryResultTopTags extends QueryResult {
  tags: Map<string, number>,
  queryId: string;

}


