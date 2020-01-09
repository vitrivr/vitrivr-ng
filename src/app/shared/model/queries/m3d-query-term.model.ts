import {AbstractQueryTerm} from './abstract-query-term.model';

export class M3DQueryTerm extends AbstractQueryTerm {
  /**
   * Default constructor.
   */
  constructor() {
    super('MODEL3D', ['sphericalharmonicsdefault'])
  }
}
