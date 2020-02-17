import {QueryTermInterface} from './query-term.interface';
import {QueryTermType} from './query-term-type.interface';
import {QueryStage} from '../query-stage.model';

export interface QueryContainerInterface {

  stages: QueryStage[];

  /**
   * Adds a new QueryTerm for the specified QueryTermType.
   *
   * @param type The QueryTermType of the new QueryTerm.
   * @returns {boolean} True if QueryTerm was added, false otherwise
   */
  addTerm(type: QueryTermType): boolean;

  /**
   * Removes the QueryTerm instance associated with the given QueryTermType.
   *
   * @param type The QueryTermType of the QueryTerm that should be removed.
   * @returns {boolean} True if QueryTerm was removed, false otherwise
   */
  removeTerm(type: QueryTermType): boolean;

  /**
   * Determines whether the current StagedQueryContainer has an instance of a QueryTerm for the given QueryTermType.
   *
   * @param type The QueryTermType
   * @returns {boolean} True if QueryTerm was created, false otherwise.
   */
  hasTerm(type: QueryTermType): boolean;

  getTerm(type: QueryTermType): QueryTermInterface;
}
