import {MediaSegmentScoreContainer} from '../results/scores/segment-score-container.model';
import {MediaObjectScoreContainer} from '../results/scores/media-object-score-container.model';

export class TemporalObjectSegments {

  constructor(public readonly object: MediaObjectScoreContainer, public segments: MediaSegmentScoreContainer[], public score: number) {
  }
}
