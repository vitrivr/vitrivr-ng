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
  name: 'ColorForRelevancePipe'
})
export class ColorForRelevancePipe implements PipeTransform {

  public transform(tag: Tag, relevance: number): string {
    return tag.colorForRelevance(relevance);
  }
}
