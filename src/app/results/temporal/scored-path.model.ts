import {Path} from './path.model';
import {SegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';

export class ScoredPath {

    constructor(public readonly path: Path, public readonly score: number) {
    }

    public toString() {
        return this.path.toString() + '::' + this.score;
    }

    get segments(): SegmentScoreContainer[] {
        return Array.from(this.path.pathMap.values());
    }
}
