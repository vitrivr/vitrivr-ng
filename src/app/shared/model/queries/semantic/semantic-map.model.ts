import {SemanticCategory} from './semantic-category.model';

export class SemanticMap {

  /**
   *
   * @param image
   * @param map
   */
  constructor(public readonly image: string, public readonly map: SemanticCategory[]) {
  }
}
