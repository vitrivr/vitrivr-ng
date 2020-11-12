import { QueryTerm } from 'app/core/openapi/model/queryTerm';
import {AbstractQueryTerm} from './abstract-query-term.model';

export class MotionQueryTerm extends AbstractQueryTerm {

  constructor() {
    super(QueryTerm.TypeEnum.MOTION, ['motion']);
  }
}
