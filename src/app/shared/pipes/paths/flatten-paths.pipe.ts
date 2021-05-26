import {Pipe, PipeTransform} from '@angular/core';
import {ScoredPathSegment} from '../../../results/temporal/scored-path-segment.model';
import {ScoredPathObjectContainer} from '../../../results/temporal/scored-path-object-container.model';

@Pipe({
  name: 'FlattenPathsPipe'
})
export class FlattenPathsPipe implements PipeTransform {

  public transform(object: ScoredPathObjectContainer): Array<ScoredPathSegment> {
    return object.getFlattenPaths();
  }
}
