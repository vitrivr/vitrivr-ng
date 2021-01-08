import {Path} from './path.model';
import {MediaSegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';

export class ScoredPath {

  constructor(public readonly path: Path, public readonly score: number) {
  }

  get segments(): MediaSegmentScoreContainer[] {
    return Array.from(this.path.pathMap.values());
  }

  public toString() {
    return this.path.toString() + '::' + this.score;
  }
}
