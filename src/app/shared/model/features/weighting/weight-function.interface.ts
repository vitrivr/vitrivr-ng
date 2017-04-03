import {Feature} from "../feature.model";
import {MediaObjectScoreContainer} from "../scores/media-object-score-container.model";
import {SegmentScoreContainer} from "../scores/segment-score-container.model";



export interface WeightFunction {

    /**
     * Calculates and returns the weighted score of a MediaObjectScoreContainer.
     *
     * @param features Features to consider when calculating the score.
     * @param mediaObjectScoreContainer MediaObjectScoreContainer for which to calculate the score.
     *
     * @return Weighted score for teh MediaObjectScoreContainer given the features
     */
    scoreForObject(features: Feature[], mediaObjectScoreContainer: MediaObjectScoreContainer): number

    /**
     * Calculates and returns the weighted score of a SegmentScoreContainer.
     *
     * @param features Features to consider when calculating the score.
     * @param segmentScoreContainer SegmentScoreContainer for which to calculate the score.
     *
     * @return Weighted score for teh MediaObjectScoreContainer given the features
     */
    scoreForSegment(features: Feature[], segmentScoreContainer: SegmentScoreContainer): number;

}