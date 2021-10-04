import {Pipe, PipeTransform} from '@angular/core';
import {MediaObjectScoreContainer} from '../../model/results/scores/media-object-score-container.model';
import {TemporalObjectSegments} from '../../model/misc/temporalObjectSegments';

@Pipe({
  name: 'ObjectFilterTemporalPipe'
})
export class ObjectFilterTemporalPipe implements PipeTransform {

  public transform<T>(filters: ((v: MediaObjectScoreContainer) => boolean)[]): ((v: TemporalObjectSegments) => boolean)[] {
    return filters.map(filter => function (scoredPathContainer: TemporalObjectSegments): boolean {
      return filter(scoredPathContainer.object);
    })
  }
}
