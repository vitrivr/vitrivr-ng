import {Pipe, PipeTransform} from '@angular/core';
import {MediaObjectDescriptor, MediaSegmentDescriptor} from '../../../../../openapi/cineast';
import {ResolverService} from '../../../core/basics/resolver.service';
import {MediaSegmentScoreContainer} from '../../model/results/scores/segment-score-container.model';

@Pipe({
  name: 'SegmentPathPipe'
})
export class SegmentPathPipe implements PipeTransform {

  constructor(public readonly _resolverService: ResolverService) {
  }

  public transform(segment: MediaSegmentScoreContainer): String {
    return this._resolverService.pathToSegment(segment)
  }
}
