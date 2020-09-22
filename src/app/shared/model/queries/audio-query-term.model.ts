import {AbstractQueryTerm} from './abstract-query-term.model';

export class AudioQueryTerm extends AbstractQueryTerm {
  sliderSetting: number;

  constructor() {
    super('AUDIO', ['audiofingerprint'])
  }
}
