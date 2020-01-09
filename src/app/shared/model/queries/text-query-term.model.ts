import {AbstractQueryTerm} from './abstract-query-term.model';

export class TextQueryTerm extends AbstractQueryTerm {
  /**
   * Default constructor.
   */
  constructor() {
    super('TEXT', []);
  }
}
