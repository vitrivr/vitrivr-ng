import {Pipe, PipeTransform} from '@angular/core';
import {MediaObjectDescriptor, MediaSegmentDescriptor, QueryTerm} from '../../../../../openapi/cineast';
import {ResolverService} from '../../../core/basics/resolver.service';
import {VbsSubmissionService} from '../../../core/vbs/vbs-submission.service';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operators';
import {AppConfig} from '../../../app.config';
import {Tag} from '../../../core/selection/tag.model';
import {ColorUtil} from '../../util/color.util';
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
