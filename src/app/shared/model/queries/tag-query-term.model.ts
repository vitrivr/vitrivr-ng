import {AbstractQueryTerm} from './abstract-query-term.model';
import {Tag} from '../../../core/openapi/model/tag';
import { QueryTerm } from 'app/core/openapi/model/queryTerm';

export class TagQueryTerm extends AbstractQueryTerm {
  tags: Tag[];

  constructor() {
    super(QueryTerm.TypeEnum.TAG, ['tags']);
  }
}
