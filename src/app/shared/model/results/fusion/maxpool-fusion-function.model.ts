import {FusionFunction} from './weight-function.interface';
import {WeightedFeatureCategory} from '../weighted-feature-category.model';
import {MediaObjectScoreContainer} from '../scores/media-object-score-container.model';
import {MediaSegmentScoreContainer} from '../scores/segment-score-container.model';


export class MaxpoolFusionFunction implements FusionFunction {

  /**
   * Calculates and returns the weighted score of a MediaObjectScoreContainer. This implementation simply
   * returns the maximum score of any of the child segments!
   *
   */
  scoreForObject(features: WeightedFeatureCategory[], mediaObjectScoreContainer: MediaObjectScoreContainer): number {
    let score = 0;
    mediaObjectScoreContainer.segments.forEach((segment: MediaSegmentScoreContainer) => {
      const segmentScore = this.scoreForSegment(features, segment);
      score = Math.max(score, segmentScore)
    });
    return score;
  }


  /**
   * Calculates and returns the weighted score of a SegmentScoreContainer. This implementation obtains
   * the max value of the all the scores in the SegmentScoreContainer.
   */
  scoreForSegment(features: WeightedFeatureCategory[], segmentScoreContainer: MediaSegmentScoreContainer): number {
    let score = 0;
    segmentScoreContainer.scores.forEach((categoryMap, containerId) => {
      categoryMap.forEach((categoryScore, category) => {
        score = Math.max(categoryScore * category.weightPercentage / 100, score);
      });
    });
    return score;
  }

  name(): string {
    return 'maxpool';
  }

}
