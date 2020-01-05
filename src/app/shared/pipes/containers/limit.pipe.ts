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
     */
    public transform<T>(array: Array<T>, count: number): Array<T> {
        if (!array || array.length === 0) {
            return [];
        }
        return array.slice(0, count);
    }
}
