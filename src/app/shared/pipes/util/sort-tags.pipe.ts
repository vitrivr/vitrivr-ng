import {Pipe, PipeTransform} from '@angular/core';
import {Tag} from '../../../../../openapi/cineast';

@Pipe({
  name: 'SortTagsPipe'
})
export class SortTagsPipe implements PipeTransform {

  public transform(tagsArray: Tag[]): Tag[] {
    tagsArray.sort(function (a, b) {
      const textA = a.name.toLowerCase();
      const textB = b.name.toLowerCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    return tagsArray;
  }
}
