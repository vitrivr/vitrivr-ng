import {QueryResult} from './query-result.interface';
import {Tag} from '../../../misc/tag.model';

/**
 * QueryToptags message.interface.ts: Defines the general structure of QueryToptags.
 */
export interface QueryResultTopTags extends QueryResult {
  tags: Tag[],
  queryId: string;

}


