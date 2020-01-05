import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'FilterPipe'
})
export class FilterPipe implements PipeTransform {

    public transform<T>(array: Array<T>, filter: ((value: T) => boolean)[]): Array<T> {
        if (!array || array.length === 0) {
            return [];
        }
        if (filter.length === 0) {
            return array;
        }
        return array.filter(v => filter.every(f => f(v)));
    }
}
