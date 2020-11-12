import { QueryTerm } from 'app/core/openapi/model/queryTerm';
import {AbstractQueryTerm} from './abstract-query-term.model';

export class M3DQueryTerm extends AbstractQueryTerm {
  sliderSetting: number;

  constructor() {
    super(QueryTerm.TypeEnum.MODEL3D, ['sphericalharmonicsdefault'])
  }
}
