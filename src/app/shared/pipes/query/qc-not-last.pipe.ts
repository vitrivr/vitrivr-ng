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
import {QueryStage} from '../../model/queries/query-stage.model';
import {QueryContainerInterface} from '../../model/queries/interfaces/query-container.interface';

@Pipe({
  name: 'QcNotLastPipe'
})
export class QcNotLastPipe implements PipeTransform {

  public transform(inList: QueryContainerInterface[], containerModel: QueryContainerInterface): boolean {
    const index = inList.indexOf(containerModel);
    return index > -1 && index < inList.length - 1;
  }
}
