import {AbstractQueryTerm} from './abstract-query-term.model';
import {QueryTerm} from '../../../../../openapi/cineast/model/queryTerm';

export class ImageQueryTerm extends AbstractQueryTerm {
  sliderSetting: number;

  constructor() {
    super(QueryTerm.TypeEnum.IMAGE, [])
  }
}
