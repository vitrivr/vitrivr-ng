import {Pipe, PipeTransform} from '@angular/core';
import {MediaObjectScoreContainer} from '../../model/results/scores/media-object-score-container.model';

@Pipe({
  name: 'LimitObjectsPipe'
})
export class LimitObjectsPipe implements PipeTransform {
  /**
   * Prunes results from the the input array by omitting all items that come after the specified index. Makes sure that a maximum of count elements is rendered
   *
   * @param array The array of result items.
   * @param count The number of items in the ouput array.
   */
  public transform(array: Array<MediaObjectScoreContainer>, count: number): Array<MediaObjectScoreContainer> {
    if (!array || array.length === 0) {
      return [];
    }
    if (!count) {
      console.debug(`returning empty array since count is undefined`);
      return [];
    }
    console.debug(`limiting to ${count} elements`);
    const _return = [];
    let i = 0;
    array.forEach(obj => {
      if (i + obj.segments.length > count) {
        return;
      }
      i += obj.segments.length;
      _return.push(obj)
    })
    return _return;
  }
}
