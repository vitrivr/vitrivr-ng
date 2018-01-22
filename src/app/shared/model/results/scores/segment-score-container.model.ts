import {ScoreContainer} from "./compound-score-container.model";
import {FusionFunction} from "../fusion/weight-function.interface";
import {WeightedFeatureCategory} from "../weighted-feature-category.model";
import {Similarity} from "../../media/similarity.model";
import {MediaSegment} from "../../media/media-segment.model";
import {MediaObjectScoreContainer} from "./media-object-score-container.model";
/**
 * The SegmentScoreContainer is a ScoreContainer for MediaSegments. It is associated with
 * a single segment (e.g. a shot of a video) and holds the score for that segment. That
 * score is determined by the actual scores of the segment (per category).
 */
export class SegmentScoreContainer extends ScoreContainer {
    /** List of scores. Entries should correspond to those in the array categories. */
    private _scores : Map<WeightedFeatureCategory, number> = new Map();

    /**
     * Default constructor.
     *
     * @param {MediaSegment} _mediaSegment Reference to the MediaSegment this container has been created for.
     * @param {MediaObjectScoreContainer} _object Reference to the MediaObjectScoreContainer that contains this SegmentScoreContainer.
     */
    public constructor(private readonly _mediaSegment: MediaSegment, private readonly _objectScoreContainer: MediaObjectScoreContainer) {
        super();

        /* Make a logic check: objectId of MediaSegment must match that of the MediaObjectScoreContainer. */
        if (_mediaSegment.objectId != _objectScoreContainer.objectId) {
            throw new Error("You cannot associate a MediaObjectScoreContainer with ID '" + _objectScoreContainer.objectId + "' with a segment with objectId '" + _mediaSegment.objectId + "'.");
        }
    }

    /**
     * Adds a similarity object to this SegmentScoreContainer by pushing the category and
     * the actual value to their respective arrays. The segmentId of the Similarity object
     * must be equal to the segmentId of the SegmentScoreContainer.
     *
     * Note: Causes an update of the score value.
     *
     * @param category
     * @param similarity
     */
    public addSimilarity(category : WeightedFeatureCategory, similarity : Similarity): boolean {
        if (similarity.key !== this._mediaSegment.segmentId) return false;
        this.scores.set(category, similarity.value);
        return true;
    }

    /**
     * Updates the score value by multiplying the scores in the scores array by the weights
     * of the associated feature-object. Only results in the provided list are considered.
     *
     * @param features List of feature categories that should be used to calculate the score.
     * @param func The fusion function that should be used to calculate the score.
     */
    public update(features: WeightedFeatureCategory[], func: FusionFunction) {
        this._score = func.scoreForSegment(features, this);
    }

    /**
     * Returns the Map of scores
     *
     * @return {Map<WeightedFeatureCategory, number>}
     */
    get scores() {
        return this._scores;
    }

    /**
     * Returns the ID of the MediaSegment.
     *
     * @returns {string}
     */
    get segmentId() {
        return this.mediaSegment.segmentId;
    }

    /**
     * Returns the ID of the MediaObject associated with the the MediaSegment.
     *
     * @returns {string}
     */
    get objectId() {
        if (!this._mediaSegment) return null;
        return this._mediaSegment.objectId;
    }

    /**
     * Returns the start time of the MediaSegment in seconds or 0, if segment does
     * not have a start time.
     *
     * @returns {number}
     */
    get starttime() {
        if (!this._mediaSegment) return 0;
        return this._mediaSegment.startabs;
    }

    /**
     * Returns the end time of the MediaSegment in seconds or 0, if segment does
     * not have an end time.
     *
     * @returns {number}
     */
    get endtime() {
        if (!this._mediaSegment) return 0;
        return this._mediaSegment.endabs;
    }

    /**
     * Getter for the actual MediaSegment.
     *
     * @return {MediaSegment}
     */
    get mediaSegment(): MediaSegment {
        return this._mediaSegment;
    }

    /**
     *
     * @return {MediaObjectScoreContainer}
     */
    get objectScoreContainer(): MediaObjectScoreContainer {
        return this._objectScoreContainer;
    }
}