import {Pipe, PipeTransform} from '@angular/core';
import {ScoredPathSegment} from '../../../results/temporal/scored-path-segment.model';
import {ScoredPathObjectContainer} from '../../../results/temporal/scored-path-object-container.model';

@Pipe({
  name: 'FlattenPathsPipe'
})
export class FlattenPathsPipe implements PipeTransform {

  public transform(object: ScoredPathObjectContainer): Array<ScoredPathSegment> {
    if (!object.scoredPaths || object.scoredPaths.length === 0) {
      return [];
    }

    const tuples = new Array<ScoredPathSegment>();
    let mark = false;
    object.scoredPaths.sort((a, b) => b.score - a.score).forEach(scoredPath => {
      scoredPath.segments.forEach(segment => tuples.push(new ScoredPathSegment(segment, scoredPath.score, mark)));
      mark = !mark;
    });
    return tuples;
  }
}
