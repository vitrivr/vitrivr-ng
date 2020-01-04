import {FusionFunction} from './weight-function.interface';
import {WeightedFeatureCategory} from '../weighted-feature-category.model';
import {MediaObjectScoreContainer} from '../scores/media-object-score-container.model';
import {SegmentScoreContainer} from '../scores/segment-score-container.model';
import {MaxpoolFusionFunction} from './maxpool-fusion-function.model';

/**
 * Averages per category on segment-level and maxpools on object-level
 */
export class AverageFusionFunction implements FusionFunction {

    private _objectFusionFunction = new MaxpoolFusionFunction();

    /**
     * Calculates and returns the weighted score of a MediaObjectScoreContainer. This implementation
     * returns the average score of any of the child segments!
     */
    scoreForObject(features: WeightedFeatureCategory[], mediaObjectScoreContainer: MediaObjectScoreContainer): number {
        return this._objectFusionFunction.scoreForObject(features, mediaObjectScoreContainer);
    }


    /**
     * Calculates the best score per category and then normalizes by all weighted features
     */
    scoreForSegment(categories: WeightedFeatureCategory[], segmentScoreContainer: SegmentScoreContainer): number {
        let score = 0;
        let total = 0;
        categories.forEach((weightedFeatureCategory: WeightedFeatureCategory) => {
            let bestScoreForCategory = 0;
            segmentScoreContainer.scores.forEach((categoryMap, containerId) => {
                if (categoryMap.has(weightedFeatureCategory)) {
                    const scoreForCategory = (categoryMap.get(weightedFeatureCategory) * weightedFeatureCategory.weightPercentage / 100);
                    bestScoreForCategory = Math.max(scoreForCategory, bestScoreForCategory);
                }
            });
            /* This is 0 if there is no match for a given category */
            score += bestScoreForCategory;
            total += (weightedFeatureCategory.weightPercentage / 100);
        });
        return (score / total);
    }

    name(): string {
        return 'average';
    }
}
