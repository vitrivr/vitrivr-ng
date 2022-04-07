import {AbstractQueryTerm} from './abstract-query-term.model';
import {QueryTerm} from '../../../../../openapi/cineast/model/queryTerm';

export class TextQueryTerm extends AbstractQueryTerm {

  constructor() {
    super(QueryTerm.TypeEnum.Text, []);
  }
}
