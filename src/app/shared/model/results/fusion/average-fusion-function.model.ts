import {FusionFunction} from './weight-function.interface';
import {WeightedFeatureCategory} from '../weighted-feature-category.model';
import {MediaObjectScoreContainer} from '../scores/media-object-score-container.model';
import {SegmentScoreContainer} from '../scores/segment-score-container.model';


export class AverageFusionFunction implements FusionFunction {
    /**
     * Calculates and returns the weighted score of a MediaObjectScoreContainer. This implementation
     * returns the average score of any of the child segments!
     */
    scoreForObject(features: WeightedFeatureCategory[], mediaObjectScoreContainer: MediaObjectScoreContainer): number {
        let score = 0;
        let count = 0;
        mediaObjectScoreContainer.segments.forEach((segment: SegmentScoreContainer) => {
            const segmentScore = this.scoreForSegment(features, segment);
            if (segmentScore > 0) {
                score += segmentScore;
                count += 1;
            }
        });

        if (count > 0) {
            return score / count;
        } else {
            return 0;
        }
    }


    /**
     * Calculates and returns the weighted score of a SegmentScoreContainer. This implementation obtains
     * the weighted mean value of the all the scores in the SegmentScoreContainer.
     *
     */
    scoreForSegment(features: WeightedFeatureCategory[], segmentScoreContainer: SegmentScoreContainer): number {
        let score = 0;
        let total = 0;
        features.forEach((value: WeightedFeatureCategory) => {
            segmentScoreContainer.scores.forEach((categoryMap, containerId) => {
                if (categoryMap.has(value)) {
                    score += (categoryMap.get(value) * value.weightPercentage / 100);
                }
                total += (value.weightPercentage / 100);
            });
        });
        return (score / total);
    }

    name(): string {
        return 'average';
    }
}
