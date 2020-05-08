import {AbstractQueryTerm} from './abstract-query-term.model';

export class TextQueryTerm extends AbstractQueryTerm {

  constructor() {
    super('TEXT', []);
  }
}
