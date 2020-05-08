import {AbstractQueryTerm} from './abstract-query-term.model';

export class ImageQueryTerm extends AbstractQueryTerm {
  sliderSetting: number;

  constructor() {
    super('IMAGE', [])
  }
}
