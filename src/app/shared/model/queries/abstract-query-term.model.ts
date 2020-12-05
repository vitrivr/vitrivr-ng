import {QueryTermInterface} from './interfaces/query-term.interface';
import {QueryTerm} from '../../../../../openapi/cineast/model/queryTerm';

export abstract class AbstractQueryTerm implements QueryTermInterface {
  /**
   * The Base64 encoded data contained in this QueryTerm. This will be sent to the API.
   */
  data: string;

  /**
   * Constructor for AbstractQueryTerm
   *
   * @param type Type of the QueryTerm
   * @param categories Default categories
   */
  protected constructor(public readonly type: QueryTerm.TypeEnum, public readonly categories: string[] = []) {
  }


  /**
   * Adds a named query category to the QueryTerm. The implementation must make sure, that
   * the category is unique.
   *
   * @param {string} category
   */
  public pushCategory(category: string) {
    const index: number = this.categories.indexOf(category);
    if (index == -1) {
      this.categories.push(category);
    }
  }

  /**
   * Returns true if QueryTerm contains specified category and false otherwise.
   *
   * @param {string} category Category that should be checked,
   * @return {boolean} True if category is contained, else false.
   */
  public hasCategory(category: string): boolean {
    return (this.categories.indexOf(category) > -1);
  }

  /**
   * Removes a named query category to the QueryTerm. The implementation must make sure, that
   * the category is unique.
   *
   * @param {string} category
   */
  public removeCategory(category: string) {
    const index: number = this.categories.indexOf(category);
    if (index > -1) {
      this.categories.splice(index, 1);
    }
  }

  /**
   * Replaces all the existing categories by the provided categories.
   *
   * @param {string} categories
   */
  public setCategories(categories: string[]) {
    this.categories.splice(0, this.categories.length);
    for (const category of categories) {
      this.categories.push(category);
    }
  }
}
