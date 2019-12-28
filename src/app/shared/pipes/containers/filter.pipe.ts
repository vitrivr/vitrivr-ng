import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'FilterPipe'
})
export class FilterPipe implements PipeTransform {

    public transform<T>(array: Array<T>, filter: ((value: T) => boolean)[]): Array<T> {
        if (!array || array.length === 0) {
            return [];
        }
        console.time('UI (Filter)');
        const results = array.filter(v => filter.every(f => f(v)));
        console.timeEnd('UI (Filter)');
        return results;
    }
}
