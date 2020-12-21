import {WeightedFeatureCategory} from '../weighted-feature-category.model';
import {MediaObjectScoreContainer} from '../scores/media-object-score-container.model';
import {SegmentScoreContainer} from '../scores/segment-score-container.model';


/**
 * This interface defines the signatures of late-fusion methods for MediaObjectScoreContainers and SegmentScoreContainers.
 * These fusion methods take a list of WeightedFeatureCategory objects and calculate a final score.
 */
export interface FusionFunction {

  /**
   * Calculates and returns the weighted score of a MediaObjectScoreContainer.
   *
   * @param features Features to consider when calculating the score.
   * @param mediaObjectScoreContainer MediaObjectScoreContainer for which to calculate the score.
   *
   * @return Weighted score for teh MediaObjectScoreContainer given the results
   */
  scoreForObject(features: WeightedFeatureCategory[], mediaObjectScoreContainer: MediaObjectScoreContainer): number

  /**
   * Calculates and returns the weighted score of a SegmentScoreContainer.
   *
   * @param features Features to consider when calculating the score.
   * @param segmentScoreContainer SegmentScoreContainer for which to calculate the score.
   *
   * @return Weighted score for teh MediaObjectScoreContainer given the results
   */
  scoreForSegment(features: WeightedFeatureCategory[], segmentScoreContainer: SegmentScoreContainer): number;

  /**
   * Human-readable name
   */
  name(): string;
}
