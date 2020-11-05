import {AbstractQueryTerm} from './abstract-query-term.model';
import {Tag} from '../../../core/openapi/model/tag';

export class TagQueryTerm extends AbstractQueryTerm {
  tags: Tag[];

  constructor() {
    super('TAG', ['tags']);
  }
}
