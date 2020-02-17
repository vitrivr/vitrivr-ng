import {QueryTermInterface} from './interfaces/query-term.interface';

export class QueryStage {
  constructor(public readonly terms: QueryTermInterface[] = []) {
  }
}
