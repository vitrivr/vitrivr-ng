import {CompoundScoreContainer} from "./compound-score-container.model";
import {MediaSegment} from "../../shared/model/media/media-segment.model";
import {Similarity} from "../../shared/model/media/similarity.model";
/**
 * The SegmentScoreContainer is a CompoundScoreContainer for MediaSegments. It is associated with
 * a single segment (e.g. a shot of a video) and holds the score for that segment. That
 * score is determined by the actual scores of the segment (per category).
 */
export class SegmentScoreContainer extends CompoundScoreContainer {
    /** List of scores. Entries should correspond to those in the array categories. */
    private scores : Map<string, number> = new Map();

    /** List of weights. Entries should correspond to categories in the array scores. */
    private weights : Map<string, number> = new Map();

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
    public addSimilarity(category : string, similarity : Similarity) {
        this.scores.set(category, similarity.value);
        this.weights.set(category, 0);
        let weight = 1 / this.weights.size;
        this.weights.forEach(function(value : number, key : string) {
            this.weights.set(key, weight);
        }.bind(this));
        this.update();
    }

    /**
     * Updates the score value by weighing the scores in the array scores by the weight
     * associated in the weights objects. If no such object was defined, all values are
     * weighted equally.
     *
     * @param weights
     */
    public update(weights? : Map<string, number>) {
        this.score = 0;
        if (weights == undefined) weights = this.weights;
        this.scores.forEach(function(value : number, key : string) {
            this.score+=value * weights.get(key);
        }.bind(this));
    }
}