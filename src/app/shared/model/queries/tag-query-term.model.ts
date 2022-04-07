import {AbstractQueryTerm} from './abstract-query-term.model';
import {Tag} from '../../../../../openapi/cineast';
import {QueryTerm} from '../../../../../openapi/cineast/model/queryTerm';

export class TagQueryTerm extends AbstractQueryTerm {
  tags: Tag[];

  constructor() {
    super(QueryTerm.TypeEnum.Tag, ['tags']);
  }
}
