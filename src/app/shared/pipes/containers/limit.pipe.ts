import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'LimitPipe'
})
export class LimitPipe implements PipeTransform {
  /**
   * Prunes results from the the input array by omitting all items that come after the specified index.
   *
   * @param array The array of result items.
   * @param count The number of items in the ouput array.
   * @param apply whether to actually apply this pipe. Used because we haven't figured a better way to combine *ngIf and pipes
   */
  public transform<T>(array: Array<T>, count: number, apply: boolean = true): Array<T> {
    if (!array || array.length === 0 || count === 0) {
      return [];
    }
    if (!apply) {
      return array;
    }
    console.debug(`Limiting to ${count} segments.`);
    return array.slice(0, count);
  }
}
