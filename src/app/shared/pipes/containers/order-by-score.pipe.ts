import {Pipe, PipeTransform} from "@angular/core";
import {SegmentScoreContainer} from "../../model/features/scores/segment-score-container.model";
import {ScoreContainer} from "../../model/features/scores/compound-score-container.model";

@Pipe({
    name: 'OrderByScorePipe'
})
export class OrderByScorePipe implements PipeTransform {

    /**
     * Returns the provided array of ScoreContainer sorted score in either ascending or descending order.
     *
     * @param {Array<ScoreContainer>} array
     * @param {string} args
     * @return {Array<ScoreContainer>}
     */
    public transform(array: Array<ScoreContainer>, desc: boolean = true): Array<ScoreContainer> {
        if(!array || array === undefined || array.length === 0) return [];
        return array.slice().sort((a: SegmentScoreContainer, b: SegmentScoreContainer) => {
            if (desc) {
                return ScoreContainer.compareDesc(a,b);
            } else {
                return ScoreContainer.compareAsc(a,b);
            }
        });
    }
}