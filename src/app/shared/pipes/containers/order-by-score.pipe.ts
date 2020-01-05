import {Pipe, PipeTransform} from '@angular/core';
import {ScoreContainer} from '../../model/results/scores/compound-score-container.model';

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
    public transform<T extends ScoreContainer>(array: Array<T>, desc: boolean = true): Array<T> {
        if (!array || array.length === 0) {
            return [];
        }
        return array.sort((a: ScoreContainer, b: ScoreContainer) => {
            if (desc) {
                return b.score - a.score;
            } else {
                return a.score - b.score
            }
        });
    }
}
