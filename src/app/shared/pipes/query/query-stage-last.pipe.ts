import {Pipe, PipeTransform} from '@angular/core';
import {QueryStage} from '../../model/queries/query-stage.model';

@Pipe({
  name: 'QueryStageLast'
})
export class QueryStageLast implements PipeTransform {

  public transform(qsList: QueryStage[], queryStage: QueryStage): boolean {
    return qsList.indexOf(queryStage) === qsList.length - 1;
  }
}
