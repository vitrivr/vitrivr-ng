import {Pipe, PipeTransform} from "@angular/core";
import {MediaObjectScoreContainer} from "../../model/results/scores/media-object-score-container.model";

@Pipe({
    name: 'FilterObjectAllPipe'
})
export class FilterObjectAllPipe implements PipeTransform {
    /**
     * Returns the provided array of MediaObjectScoreContainer filtered by the array of filters. A MediaObjectScoreContainer must pass ALL filters in order
     * to be included in the file array.
     *
     * @param {Array<MediaObjectScoreContainer>} array
     * @param {((value:MediaObjectScoreContainer) => boolean)[]} filter
     * @return {Array<MediaObjectScoreContainer>}
     */
    public transform(array: Array<MediaObjectScoreContainer>, filter: ((value:MediaObjectScoreContainer) => boolean)[]): Array<MediaObjectScoreContainer> {
        if(!array || array === undefined || array.length === 0) return [];
        return array.filter(v => filter.every(f => f(v)));
    }
}