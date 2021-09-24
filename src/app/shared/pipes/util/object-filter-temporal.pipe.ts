import {Pipe, PipeTransform} from '@angular/core';
import {ScoredPathObjectContainer} from '../../../results/temporal/scored-path-object-container.model';
import {MediaObjectScoreContainer} from '../../model/results/scores/media-object-score-container.model';

@Pipe({
  name: 'ObjectFilterTemporalPipe'
})
export class ObjectFilterTemporalPipe implements PipeTransform {

  public transform<T>(filters: ((v: MediaObjectScoreContainer) => boolean)[]): ((v: ScoredPathObjectContainer) => boolean)[] {
    return filters.map(filter => function (scoredPathContainer: ScoredPathObjectContainer): boolean {
      return filter(scoredPathContainer.objectScoreContainer);
    })
  }
}
