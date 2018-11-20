import {Pipe, PipeTransform} from "@angular/core";
import {ScoreContainer} from "../../model/results/scores/compound-score-container.model";

@Pipe({
    name: 'FilterPipe'
})
export class FilterPipe implements PipeTransform {
    /**
     * Returns the provided array of ScoreContainers filtered by the array of filters. A ScoreContainer must pass ALL filters in order to be included in the final array.
     *
     * @param array The array of ScoreContainers that should be filtered.
     * @param filter The array of filters that should be applied.
     * @return Sorted array of ScoreContainers.
     */
    public transform<T extends ScoreContainer>(array: Array<T>, filter: ((value:T) => boolean)[]): Array<T> {
        if(!array || array === undefined || array.length === 0) return [];
        console.time("UI (Filter)");
        let results = array.filter(v => filter.every(f => f(v)));
        console.timeEnd("UI (Filter)");
        return results;
    }
}