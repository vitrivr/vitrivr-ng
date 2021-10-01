import {Pipe, PipeTransform} from '@angular/core';
import {MediaObjectDescriptor, MediaSegmentDescriptor} from '../../../../../openapi/cineast';
import {ResolverService} from '../../../core/basics/resolver.service';
import {VbsSubmissionService} from '../../../core/vbs/vbs-submission.service';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operators';
import {AppConfig} from '../../../app.config';
import {Tag} from '../../../core/selection/tag.model';
import {ColorUtil} from '../../util/color.util';

@Pipe({
  name: 'ScorePercentagePipe'
})
export class ScorePercentagePipe implements PipeTransform {

  public transform(score: number): number {
    return Math.round(score * 1000) / 10
  }
}
