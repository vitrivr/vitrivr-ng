import {CompoundScoreContainer} from "./compound-score-container.model";
import {MediaSegment} from "../../shared/model/media/media-segment.model";
import {Similarity} from "../../shared/model/media/similarity.model";
import {Feature} from "../../shared/model/features/feature.model";
/**
 * The SegmentScoreContainer is a CompoundScoreContainer for MediaSegments. It is associated with
 * a single segment (e.g. a shot of a video) and holds the score for that segment. That
 * score is determined by the actual scores of the segment (per category).
 */
export class SegmentScoreContainer extends CompoundScoreContainer {
    /** List of scores. Entries should correspond to those in the array categories. */
    private scores : Map<Feature, number> = new Map();

    /** Reference to the actual MediaSegment this container belongs to. */
    public mediaSegment? : MediaSegment;

    /**
     * Adds a similarity object to this SegmentScoreContainer by pushing the category and
     * the actual value to their respective arrays.
     *
     * Note: Causes an update of the score value.
     *
     * @param category
     * @param similarity
     */
    public addSimilarity(category : Feature, similarity : Similarity) {
        this.scores.set(category, similarity.value);
    }

    /**
     * Updates the score value by multiplying the scores in the scores array by the weights
     * of the associated feature-object. Only features in the provided list are considered.
     *
     * @param features List of features that should be used to calculate the score.
     */
    public update(features: Feature[]) {
        this.score = 0;
        let total = 0;
        features.forEach((value: Feature) => {
            if (this.scores.has(value)) this.score += (this.scores.get(value) * value.weight);
            total += value.weight;
        });
        this.score /= total;
    }
}