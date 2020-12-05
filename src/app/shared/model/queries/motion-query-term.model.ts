import {AbstractQueryTerm} from './abstract-query-term.model';
import {QueryTerm} from '../../../../../openapi/cineast/model/queryTerm';

export class MotionQueryTerm extends AbstractQueryTerm {

  constructor() {
    super(QueryTerm.TypeEnum.MOTION, ['motion']);
  }
}
