import {Pipe, PipeTransform} from "@angular/core";
import {ScoreContainer} from "../../model/results/scores/compound-score-container.model";

@Pipe({
    name: 'OrderByScorePipe'
})
export class OrderByScorePipe implements PipeTransform {

    /**
     * Returns the provided array of ScoreContainer sorted score in either ascending or descending order.
     *
     * @param {Array<ScoreContainer>} array
     * @param {string} desc
     * @return {Array<ScoreContainer>}
     */
    public transform(array: Array<ScoreContainer>, desc: boolean = true): Array<ScoreContainer> {
        if(!array || array === undefined || array.length === 0) return [];
        console.time("UI (Sort by Score)");
        let results = array.sort((a: ScoreContainer, b: ScoreContainer) => {
            if (desc) {
                return ScoreContainer.compareDesc(a,b);
            } else {
                return ScoreContainer.compareAsc(a,b);
            }
        });
        console.timeEnd("UI (Sort by Score)");
        return results;
    }
}