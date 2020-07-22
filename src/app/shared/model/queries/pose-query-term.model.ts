import {AbstractQueryTerm} from './abstract-query-term.model';

export class PoseQueryTerm extends AbstractQueryTerm {

  constructor() {
    super('POSE', ['pose']);
  }
}
