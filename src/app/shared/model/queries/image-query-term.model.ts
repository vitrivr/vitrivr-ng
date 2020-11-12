import { QueryTerm } from 'app/core/openapi/model/queryTerm';
import {AbstractQueryTerm} from './abstract-query-term.model';

export class ImageQueryTerm extends AbstractQueryTerm {
  sliderSetting: number;

  constructor() {
    super(QueryTerm.TypeEnum.IMAGE, [])
  }
}
