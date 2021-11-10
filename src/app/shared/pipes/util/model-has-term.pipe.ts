import {Pipe, PipeTransform} from '@angular/core';
import {QueryTerm} from '../../../../../openapi/cineast';
import {QueryContainerInterface} from '../../model/queries/interfaces/query-container.interface';

@Pipe({
  name: 'ModelHasTermPipe'
})
export class ModelHasTermPipe implements PipeTransform {

  /**
   * returns hasTerm() on a container model
   * @param containerModel underlying container model
   * @param term term to be looked up
   * @param trigger is ignored. Used here so pipe-recalculation can be triggered without changing the reference to the containerModel
   */
  public transform(containerModel: QueryContainerInterface, term: QueryTerm.TypeEnum, trigger: boolean): boolean {
    return containerModel.hasTerm(term)
  }
}
