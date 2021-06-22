import {Pipe, PipeTransform} from '@angular/core';
import {ScoredPathSegment} from '../../../results/temporal/scored-path-segment.model';
import {ScoredPathObjectContainer} from '../../../results/temporal/scored-path-object-container.model';
import {TemporalObjectSegments} from '../../model/misc/temporalObjectSegments';
import {MediaSegmentScoreContainer} from '../../model/results/scores/segment-score-container.model';

@Pipe({
  name: 'FlattenPathsPipe'
})
export class FlattenPathsPipe implements PipeTransform {

  public transform(object: TemporalObjectSegments): Array<MediaSegmentScoreContainer> {
    return object.segments;
  }
}
