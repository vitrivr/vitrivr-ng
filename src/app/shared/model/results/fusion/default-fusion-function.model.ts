import {FusionFunction} from './weight-function.interface';
import {WeightedFeatureCategory} from '../weighted-feature-category.model';
import {MediaObjectScoreContainer} from '../scores/media-object-score-container.model';
import {SegmentScoreContainer} from '../scores/segment-score-container.model';


export class DefaultFusionFunction implements FusionFunction {
  /**
   * Calculates and returns the weighted score of a MediaObjectScoreContainer. This implementation simply
   * returns the maximum score of any of the child segments!
   *
   */
  scoreForObject(features: WeightedFeatureCategory[], mediaObjectScoreContainer: MediaObjectScoreContainer): number {
    let score = 0;
    mediaObjectScoreContainer.segments.forEach((segment: SegmentScoreContainer) => {
      const segmentScore = this.scoreForSegment(features, segment);
      score = Math.max(score, segmentScore)
    });
    return score;
  }


  /**
   * Calculates and returns the weighted score of a SegmentScoreContainer. This implementation obtains
   * the max value of the all the scores in the SegmentScoreContainer.
   */
  scoreForSegment(features: WeightedFeatureCategory[], segmentScoreContainer: SegmentScoreContainer): number {
    let score = 0;
    segmentScoreContainer.scores.forEach((categoryMap, containerId) => {
      categoryMap.forEach((categoryScore, category) => {
        score = Math.max(categoryScore, score);
      });
    });
    return score;
  }

}
