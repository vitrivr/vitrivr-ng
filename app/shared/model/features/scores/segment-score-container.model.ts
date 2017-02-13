import {ScoreContainer} from "./compound-score-container.model";
import {WeightFunction} from "../weighting/weight-function.interface";
import {Feature} from "../feature.model";
import {Similarity} from "../../media/similarity.model";
import {MediaSegment} from "../../media/media-segment.model";
/**
 * The SegmentScoreContainer is a ScoreContainer for MediaSegments. It is associated with
 * a single segment (e.g. a shot of a video) and holds the score for that segment. That
 * score is determined by the actual scores of the segment (per category).
 */
export class SegmentScoreContainer extends ScoreContainer {
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
     * @param features List of feature categories that should be used to calculate the score.
     * @param func The weighting function that should be used to calculate the score.
     */
    public update(features: Feature[], func: WeightFunction) {
        this.score = func.scoreForSegment(features, this);
    }

    /**
     *
     */
    public getScores() {
        return this.scores;
    }
}