import {Pipe, PipeTransform} from '@angular/core';
import {QueryStage} from '../../model/queries/query-stage.model';

@Pipe({
  name: 'QueryStageIndexPipe'
})
export class QueryStageIndexPipe implements PipeTransform {

  public transform(qsList: QueryStage[], queryStage: QueryStage): number {
    return qsList.indexOf(queryStage);
  }
}
