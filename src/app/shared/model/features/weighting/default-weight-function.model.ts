import {WeightFunction} from "./weight-function.interface";
import {Feature} from "../feature.model";
import {MediaObjectScoreContainer} from "../scores/media-object-score-container.model";
import {SegmentScoreContainer} from "../scores/segment-score-container.model";


export class DefaultWeightFunction implements WeightFunction {
    /**
     * Calculates and returns the weighted score of a MediaObjectScoreContainer. This implementation simply
     * returns the maximum score of any of the child segments!
     *
     * @param features Feature categories to consider when calculating the score.
     * @param mediaObjectScoreContainer MediaObjectScoreContainer for which to calculate the score.
     *
     * @return Weighted score for teh MediaObjectScoreContainer given the features
     */
    scoreForObject(features: Feature[], mediaObjectScoreContainer: MediaObjectScoreContainer): number {
        let score = 0;
        mediaObjectScoreContainer.getSegmentScores().forEach((value : SegmentScoreContainer, key: string) => {
            value.update(features, this);
            score = Math.max(score, value.score)
        });

        return score;
    }


    /**
     * Calculates and returns the weighted score of a SegmentScoreContainer. This implementation obtains
     * the weighted mean value of the all the scores in the SegmentScoreContainer.
     *
     * @param features Feature categories to consider when calculating the score.
     * @param segmentScoreContainer SegmentScoreContainer for which to calculate the score.
     *
     * @return Weighted score for teh MediaObjectScoreContainer given the features
     */
    scoreForSegment(features: Feature[], segmentScoreContainer: SegmentScoreContainer): number {
        let score = 0;
        let total = 0;
        features.forEach((value: Feature) => {
            if (segmentScoreContainer.getScores().has(value))score += (segmentScoreContainer.getScores().get(value) * value.weight);
            total += value.weight;
        });
       return (score / total);
    }

}