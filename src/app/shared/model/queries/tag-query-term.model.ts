import {AbstractQueryTerm} from './abstract-query-term.model';

export class TagQueryTerm extends AbstractQueryTerm {
  /**
   * Default constructor.
   */
  constructor() {
    super('TAG', ['tags']);
  }
}
