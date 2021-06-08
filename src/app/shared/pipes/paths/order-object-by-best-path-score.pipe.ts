import {Pipe, PipeTransform} from '@angular/core';
import {ScoredPathObjectContainer} from '../../../results/temporal/scored-path-object-container.model';

@Pipe({
  name: 'OrderObjectByBestPathScorePipe'
})
export class OrderObjectByBestPathScorePipe implements PipeTransform {

  public transform(array: Array<ScoredPathObjectContainer>, desc: boolean = true): Array<ScoredPathObjectContainer> {
    if (!array || array.length === 0) {
      return [];
    }
    return array.sort((a: ScoredPathObjectContainer, b: ScoredPathObjectContainer) => {
      if (desc) {
        return b._score - a._score
      } else {
        return a._score - b._score;
      }
    });
  }
}
