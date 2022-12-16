import {AbstractQueryTerm} from './abstract-query-term.model';
import {QueryTerm} from '../../../../../openapi/cineast/model/queryTerm';

export class TextQueryTerm extends AbstractQueryTerm {

  constructor(public categoryName: string, private category: string) {
    super(QueryTerm.TypeEnum.Text, []);
  }

  public enable() {
    this.pushCategory(this.category);
  }

  public disable() {
    this.removeCategory(this.category);
  }
}
