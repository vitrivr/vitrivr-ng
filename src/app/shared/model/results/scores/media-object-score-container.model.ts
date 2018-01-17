
import {ScoreContainer} from "./compound-score-container.model";
import {SegmentScoreContainer} from "./segment-score-container.model";
import {MediaObject} from "../../media/media-object.model";
import {MediaSegment} from "../../media/media-segment.model";
import {WeightedFeatureCategory} from "../weighted-feature-category.model";
import {Similarity} from "../../media/similarity.model";
import {FusionFunction} from "../fusion/weight-function.interface";
import {MediaType} from "../../media/media-type.model";

/**
 * The MediaObjectScoreContainer is a ScoreContainer for MediaObjects. It is associated with
 * a single MediaObject (e.g. a video, audio or 3d-model file) and holds the score for that object. That
 * score is determined by the scores of the SegmentScoreContainers hosted by a concrete instance of this class.
 */
export class MediaObjectScoreContainer extends ScoreContainer {
    /** Map of SegmentScoreContainer for all the SegmentObject's that belong to this MediaObject. */
    private _segmentScores : Map<string, SegmentScoreContainer> = new Map();

    /** List of SegmentScoreContainer that belong to this MediaObjectScoreContainer. */
    private _segments : SegmentScoreContainer[] = [];

    /** Reference to the actual MediaObject this container belongs to. */
    private _object? : MediaObject;

    /** A internal caching structures for Feature <-> Similarity paris that do not have a SegmentScoreContainer yet. */
    private _cache : Map<string,Array<[WeightedFeatureCategory,Similarity]>> = new Map();

    /**
     * Default constructor.
     *
     * @param _objectId
     */
    public constructor(private _objectId : string) {
        super();
    }

    /**
     * Adds a MediaSegment to the MediaObjectContainer. That Segment is actually not
     * added to the container itself but to the respective SegmentScoreContainer (contained in
     * {segmentScores})
     *
     * @param segment MediaSegment to add.
     */
    public addMediaSegment(segment : MediaSegment) : SegmentScoreContainer {
        let ssc = this.uniqueSegmentScoreContainer(segment);
        if (this._cache.has(ssc.segmentId)) {
            this._cache.get(ssc.segmentId).forEach(v => {
                this.addSimilarity(v[0], v[1])
            });
            this._cache.delete(ssc.segmentId)
        }
        return ssc;
    }

    /**
     *
     * @param category
     * @param similarity
     */
    public addSimilarity(category : WeightedFeatureCategory, similarity : Similarity) {
        if (this._segmentScores.has(similarity.key)) {
            this._segmentScores.get(similarity.key).addSimilarity(category, similarity);
        } else if (this._cache.has(similarity.key)) {
            this._cache.get(similarity.key).push([category, similarity]);
        } else {
            this._cache.set(similarity.key,[]);
            this._cache.get(similarity.key).push([category, similarity]);
        }
    }

    /**
     * Updates the score of this MediaObjectScoreContainer.
     *
     * @param features List of feature categories that should be used to calculate the score.
     * @param func The weight function that should be used to calculate the score.
     */
    public update(features: WeightedFeatureCategory[], func: FusionFunction) {
        this._score = func.scoreForObject(features, this);
    }

    /**
     * Setter for media object.
     *
     * @param value New value.
     */
    set object(value: MediaObject) {
        if (this._objectId == value.objectId) this._object = value;
    }

    /**
     * Getter for the media object
     *
     * @return {MediaObject | undefined}
     */
    get object() {
        return this._object
    }

    /**
     * Getter for the media object's ID.
     *
     * @return {string}
     */
    get objectId() : string {
        return this._objectId;
    }

    /**
     * Getter for media object's name.
     *
     * @return {string}
     */
    get name() : string {
        return this._object.name;
    }

    /**
     * Getter for the media object's ID.
     *
     * @return {string}
     */
    get mediatype() : MediaType {
        return this._object.mediatype;
    }

    /**
     * Getter for the media object's path.
     */
    get path() : string {
        return this._object.path;
    }

    /**
     * Method used by the UI/Template part. Can be used to determine whether this
     * MediaObjectScoreContainer is ready to be displayed.
     *
     * @returns {boolean} true if it can be displayed, false otherwise.
     */
    get show() : boolean {
        return (this._object && this._segmentScores.size > 0);
    }

    /**
     *
     * @return {SegmentScoreContainer[]}
     */
    get segments(): SegmentScoreContainer[] {
        return this._segments;
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
        return this.segments.reduce((a,b) => { return a.score > b.score ? a : b});
    }

    /**
     * Returns a unique SegmentScoreContainer instance for the provided segmentId. That is, if a SegmentScoreContainer
     * has been created and registered with the MediaObjectScoreContainer for the provided segmentId, that instance is returned.
     * Otherwise, a new instance is created and registered.
     *
     * @param {string} segment MediaSegment for which to create a SegmentScoreContainer.
     * @return {SegmentScoreContainer}
     */
    private uniqueSegmentScoreContainer(segment: MediaSegment): SegmentScoreContainer {
        if (!this._segmentScores.has(segment.segmentId)) {
            let ssc = new SegmentScoreContainer(segment, this);
            this._segmentScores.set(segment.segmentId, ssc);
            this._segments.push(ssc);
        }
        return this._segmentScores.get(segment.segmentId);
    }
}