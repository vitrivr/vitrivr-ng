import {MediaSegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';

/**
 * This is a tuple of <SegmentScoreContainer, score (of path)>, this is used for rendering
 */
export class ScoredPathSegment {
  constructor(
    public readonly segment: MediaSegmentScoreContainer,
    public readonly score: number) {
  }

  get toString(): string {
    return `${this.segment.segmentId}<>${this.score}`;
  }
}
