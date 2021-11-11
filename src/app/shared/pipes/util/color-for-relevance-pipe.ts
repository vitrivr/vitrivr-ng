import {Pipe, PipeTransform} from '@angular/core';
import {Tag} from '../../../core/selection/tag.model';

@Pipe({
  name: 'ColorForRelevancePipe'
})
export class ColorForRelevancePipe implements PipeTransform {

  public transform(tag: Tag, relevance: number): string {
    return tag.colorForRelevance(relevance);
  }
}
