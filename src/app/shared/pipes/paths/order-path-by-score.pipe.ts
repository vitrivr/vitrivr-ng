import {Pipe, PipeTransform} from '@angular/core';
import {ScoredPath} from '../../../results/temporal/scored-path.model';

@Pipe({
    name: 'OrderPathByScorePipe'
})
export class OrderPathByScorePipe implements PipeTransform {

    public transform(array: Array<ScoredPath>, desc: boolean = true): Array<ScoredPath> {
        if (!array || array === undefined || array.length === 0) {
            return [];
        }
        console.time('UI (Sort by Score)');
        const results = array.sort((a: ScoredPath, b: ScoredPath) => {
            if (desc) {
                return b.score - a.score
            } else {
                return b.score - a.score;
            }
        });
        console.timeEnd('UI (Sort by Score)');
        return results;
    }
}
