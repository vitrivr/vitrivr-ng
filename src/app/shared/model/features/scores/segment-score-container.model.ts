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
    private _scores : Map<Feature, number> = new Map();

    /** Reference to the actual MediaSegment this container belongs to. */
    private _mediaSegment? : MediaSegment;

    /**
     * Default constructor.
     *
     * @param _segmentId
     */
    public constructor(private _segmentId : string) {
       super();
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
    public addSimilarity(category : Feature, similarity : Similarity): boolean {
        if (similarity.key !== this._segmentId) return false;
        this.scores.set(category, similarity.value);
        return true;
    }

    /**
     * Sets the MediaSegment of the SegmentScoreContainer. The MediaSegment can only be set
     * once and its segmentId must be equal to the segmentId of the SegmentScoreContainer.
     *
     * @param segment MediaSegment to set.
     * @return true if MediaSegment was set, false otherwise.
     */
    public setMediaSegment(segment: MediaSegment) {
        if (this._mediaSegment || segment.segmentId !== this._segmentId) return false;
        this._mediaSegment = segment;
    }

    /**
     * Updates the score value by multiplying the scores in the scores array by the weights
     * of the associated feature-object. Only features in the provided list are considered.
     *
     * @param features List of feature categories that should be used to calculate the score.
     * @param func The weighting function that should be used to calculate the score.
     */
    public update(features: Feature[], func: WeightFunction) {
        this._score = func.scoreForSegment(features, this);
    }

    /**
     * Returns the Map of scores
     *
     * @return {Map<Feature, number>}
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
        return this._segmentId;
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
        return Math.round(this._mediaSegment.startabs*100)/100;
    }

    /**
     * Returns the end time of the MediaSegment in seconds or 0, if segment does
     * not have an end time.
     *
     * @returns {number}
     */
    get endtime() {
        if (!this._mediaSegment) return 0;
        return Math.round(this._mediaSegment.endabs*100)/100;
    }

    /**
     * Getter for the actual MediaSegment.
     *
     * @return {MediaSegment}
     */
    get mediaSegment(): MediaSegment {
        return this._mediaSegment;
    }
}