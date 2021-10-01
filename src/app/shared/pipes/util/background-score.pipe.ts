import {Pipe, PipeTransform} from '@angular/core';
import {MediaObjectDescriptor, MediaSegmentDescriptor} from '../../../../../openapi/cineast';
import {ResolverService} from '../../../core/basics/resolver.service';
import {VbsSubmissionService} from '../../../core/vbs/vbs-submission.service';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operators';
import {AppConfig} from '../../../app.config';
import {Tag} from '../../../core/selection/tag.model';
import {ColorUtil} from '../../util/color.util';
import {MediaSegmentScoreContainer} from '../../model/results/scores/segment-score-container.model';
import {TemporalObjectSegments} from '../../model/misc/temporalObjectSegments';
import {SelectionService} from '../../../core/selection/selection.service';
import {AbstractResultsViewComponent} from '../../../results/abstract-results-view.component';

@Pipe({
  name: 'BackgroundScorePipe'
})
export class BackgroundScorePipe implements PipeTransform {

  constructor(private _selectionService: SelectionService) {
  }

  public transform(score: number, segment: MediaSegmentScoreContainer, temporalObject?: TemporalObjectSegments): string {
    const tags: Tag[] = this._selectionService.getTags(segment.segmentId);
    return AbstractResultsViewComponent.staticBackgroundForScore(score, segment, tags, temporalObject)
  }
}