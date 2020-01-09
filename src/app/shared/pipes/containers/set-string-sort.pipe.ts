import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'sortStringSet'
})
export class SetStringSortPipe implements PipeTransform {
  transform(set: Set<string>, args: string): Array<string> {
    if (set === undefined || set === null) {
      return new Array<string>();
    }
    return Array.from(set).sort((a: any, b: any) => {
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
