import {AbstractQueryTerm} from './abstract-query-term.model';
import {Tag} from '../misc/tag.model';

export class TagQueryTerm extends AbstractQueryTerm {
  tags: Tag[];

  constructor() {
    super('TAG', ['tags']);
  }
}
