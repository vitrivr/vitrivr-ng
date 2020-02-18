import {AbstractQueryTerm} from './abstract-query-term.model';

export class ImageQueryTerm extends AbstractQueryTerm {
  sliderSetting: number;

  /**
   * Default constructor.
   */
  constructor() {
    super('IMAGE', [])
  }
}
