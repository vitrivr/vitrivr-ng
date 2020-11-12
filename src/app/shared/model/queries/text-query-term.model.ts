import { QueryTerm } from 'app/core/openapi/model/queryTerm';
import {AbstractQueryTerm} from './abstract-query-term.model';

export class TextQueryTerm extends AbstractQueryTerm {

  constructor() {
    super(QueryTerm.TypeEnum.TEXT, []);
  }
}
