import {Pipe, PipeTransform} from "@angular/core";
import {SegmentScoreContainer} from "../../model/results/scores/segment-score-container.model";

@Pipe({
    name: 'FilterSegmentAllPipe'
})
export class FilterSegmentAllPipe implements PipeTransform {
    /**
     * Returns the provided array of SegmentScoreContainer filtered by the array of filters. A SegmentScoreContainer must pass ALL filters in order
     * to be included in the file array.
     *
     * @param {Array<SegmentScoreContainer>} array
     * @param {((value:SegmentScoreContainer) => boolean)[]} filter
     * @return {Array<SegmentScoreContainer>}
     */
    public transform(array: Array<SegmentScoreContainer>, filter: ((value:SegmentScoreContainer) => boolean)[]): Array<SegmentScoreContainer> {
        if(!array || array === undefined || array.length === 0) return [];
        return array.filter(v => filter.every(f => f(v)));
    }
}