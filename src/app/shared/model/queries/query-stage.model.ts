import {QueryTermInterface} from './interfaces/query-term.interface';

/**
 * A QueryStage can contain multiple terms (e.g. a boolean query for wednesday and a tag query for building)
 */
export class QueryStage {
  constructor(public readonly terms: QueryTermInterface[] = []) {
  }
}
