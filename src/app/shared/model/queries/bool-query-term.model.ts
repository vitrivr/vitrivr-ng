import {AbstractQueryTerm} from './abstract-query-term.model';
import {BoolTerm} from '../../../query/containers/bool/individual/bool-term';
import {Base64Util} from '../../util/base64.util';
import {QueryTerm} from '../../../../../openapi/cineast/model/queryTerm';

/**
 * A boolean query is compromised of multiple elements, which are concatenated with an OR
 */
export class BoolQueryTerm extends AbstractQueryTerm {

  public readonly terms: BoolTerm[] = [];
  public weight = 1;

  constructor() {
    super(QueryTerm.TypeEnum.BOOLEAN, ['boolean']);
  }

  /**
   * Removes a term and updates the data
   */
  public removeTerm(term: BoolTerm) {
    this.terms.splice(this.terms.indexOf(term), 1);
    this.update();
  }
  /**
   * Sets the current ContainerWeight
   */
  public setWeight(weight: number) {
    this.weight = weight;
    this.update();
  }

  /**
   * Updates serialization
   */
  update() {
      this.data = 'data:application/json;base64,' + Base64Util.strToBase64(JSON.stringify(this));
  }
}
