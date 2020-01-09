import {AbstractQueryTerm} from './abstract-query-term.model';

export class AudioQueryTerm extends AbstractQueryTerm {
  /**
   * Default constructor.
   */
  constructor() {
    super('AUDIO', ['audiofingerprint'])
  }
}
