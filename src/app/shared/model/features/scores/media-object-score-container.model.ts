
import {ScoreContainer} from "./compound-score-container.model";
import {SegmentScoreContainer} from "./segment-score-container.model";
import {MediaObject} from "../../media/media-object.model";
import {MediaSegment} from "../../media/media-segment.model";
import {Feature} from "../feature.model";
import {Similarity} from "../../media/similarity.model";
import {WeightFunction} from "../weighting/weight-function.interface";

/**
 * The MediaObjectScoreContainer is a ScoreContainer for MediaObjects. It is associated with
 * a single MediaObject (e.g. a video, audio or 3d-model file) and holds the score for that object. That
 * score is determined by the scores of the SegmentScoreContainers hosted by a concrete instance of this class.
 */
export class MediaObjectScoreContainer extends ScoreContainer {
    /** Map of SegmentScoreContainer for all the SegmentObject's that belong to this MediaObject. */
    private _segmentScores : Map<string, SegmentScoreContainer> = new Map();

    /** Reference to the actual MediaObject this container belongs to. */
    private _mediaObject? : MediaObject;

    /**
     * Getter for the list of map for segment-scores.
     *
     * @returns {Map<string, SegmentScoreContainer>}
     */
    get segmentScores(): Map<string, SegmentScoreContainer> {
        return this._segmentScores;
    }

    /**
     * Getter for MediaObject
     *
     * @return {MediaObject}
     */
    get mediaObject(): MediaObject {
        return this._mediaObject;
    }

    /**
     * Setter for MediaObject
     * 
     * @param value
     */
    set mediaObject(value: MediaObject) {
        this._mediaObject = value;
    }

    /**
     * Number of segments that were retrieved for the current MediaObjectScoreContainer
     *
     * @returns {MediaObject}
     */
    get numberOfSegments() : number {
        return this._segmentScores.size;
    }

    /**
     * Getter for the most representative segment.
     *
     * @returns {SegmentScoreContainer}
     */
    get representativeSegment() : SegmentScoreContainer {
        let representativeSegment : SegmentScoreContainer;
        this._segmentScores.forEach((value, key) => {
            if (representativeSegment == undefined || representativeSegment.score < value.score) {
                representativeSegment = value
            }
        });
        return representativeSegment;
    }

    /**
     * Adds a MediaSegment to the MediaObjectContainer. That Segment is actually not
     * added to the container itself but to the respective SegmentScoreContainer (contained in
     * {segmentScores})
     *
     * @param segment MediaSegment to add.
     */
    public addMediaSegment(segment : MediaSegment) {
        if (!this._segmentScores.has(segment.segmentId))  this._segmentScores.set(segment.segmentId, new SegmentScoreContainer(segment.segmentId));
        this._segmentScores.get(segment.segmentId).setMediaSegment(segment);
    }

    /**
     *
     * @param category
     * @param similarity
     */
    public addSimilarity(category : Feature, similarity : Similarity) {
        if (!this._segmentScores.has(similarity.key)) this._segmentScores.set(similarity.key, new SegmentScoreContainer(similarity.key));
        this._segmentScores.get(similarity.key).addSimilarity(category, similarity);
    }

    /**
     * Updates the score of this MediaObjectScoreContainer.
     *
     * @param features List of feature categories that should be used to calculate the score.
     * @param func The weight function that should be used to calculate the score.
     */
    public update(features: Feature[], func: WeightFunction) {
        this._score = func.scoreForObject(features, this);
    }

    /**
     * Method used by the UI/Template part. Can be used to determine whether this MediaObjectScoreContainer
     * is ready to be displayed.
     *
     * @returns {boolean} true if it can be displayed, false otherwise.
     */
    public show() : boolean {
        return this._mediaObject != undefined && this._segmentScores.size > 0;
    }
}