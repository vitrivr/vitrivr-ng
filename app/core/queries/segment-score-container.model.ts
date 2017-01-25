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
     * Updates the score value by weighing the scores in the array scores by the weight
     * associated in the features objects. If no such object was defined, all values are
     * weighted equally.
     *
     * @param features
     */
    public update() {
        this.score = 0;
        let total = 0;
        this.scores.forEach((value : number, key : Feature) => {
            total += key.weight
            this.score += (value * key.weight);
        });
        this.score /= total;
    }
}