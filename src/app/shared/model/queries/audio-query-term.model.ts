import { QueryTerm } from 'app/core/openapi/model/queryTerm';
import {AbstractQueryTerm} from './abstract-query-term.model';

export class AudioQueryTerm extends AbstractQueryTerm {
  sliderSetting: number;

  constructor() {
    super(QueryTerm.TypeEnum.AUDIO, ['audiofingerprint'])
  }
}
