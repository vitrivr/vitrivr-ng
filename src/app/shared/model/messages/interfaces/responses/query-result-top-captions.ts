import {QueryResult} from './query-result.interface';

/**
 * Aggregate information about captions occuring in the result elements
 */
export interface QueryResultTopCaptions extends QueryResult {
  /** <caption, #occurences>, e.g. <boy riding bike, 10>*/
  captions: Map<string, number>,
  queryId: string;
}


