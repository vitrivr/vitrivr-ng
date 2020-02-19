import {AbstractQueryTerm} from './abstract-query-term.model';

export class MotionQueryTerm extends AbstractQueryTerm {

  constructor() {
    super('MOTION', ['motion']);
  }
}
