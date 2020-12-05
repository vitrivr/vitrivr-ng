import {AbstractQueryTerm} from './abstract-query-term.model';
import {QueryTerm} from '../../../../../openapi/cineast/model/queryTerm';

export class M3DQueryTerm extends AbstractQueryTerm {
  sliderSetting: number;

  constructor() {
    super(QueryTerm.TypeEnum.MODEL3D, ['sphericalharmonicsdefault'])
  }
}
