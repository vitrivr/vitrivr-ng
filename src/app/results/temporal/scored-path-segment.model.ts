import {SegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {ScoredPath} from './scored-path.model';

/**
 * This is a tuple of <SegmentScoreContainer,score (of path)>, this is used for rendering
 */
export class ScoredPathSegment {
  constructor(
    public readonly segment: SegmentScoreContainer,
    public readonly score: number,
    public readonly mark: boolean) {
  }

  get toString(): string {
    return `${this.segment.segmentId}<>${this.score}`;
  }
}
