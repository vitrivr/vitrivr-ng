import {MediaSegment} from "../../shared/model/media/media-segment.model";
import {Similarity} from "../../shared/model/media/similarity.model";
import {MediaObject} from "../../shared/model/media/media-object.model";
import {CompoundScoreContainer} from "./compound-score-container.model";
import {SegmentScoreContainer} from "./segment-score-container.model";
import {Feature} from "../../shared/model/features/feature.model";
/**
 * The MediaObjectScoreContainer is a CompoundScoreContainer for MediaObjects. It is associated with
 * a single MediaObject (e.g. a video, audio or 3d-model file) and holds the score for that object. That
 * score is determined by the scores of the SegmentScoreContainers hosted by a concrete instance of this class.
 */
export class MediaObjectScoreContainer extends CompoundScoreContainer {
    /** Map of SegmentScoreContainer for all the SegmentObject's that belong to this MediaObject. */
    private segmentScores : Map<string, SegmentScoreContainer> = new Map();

    /** SegmentId of the segment that is representative for this MediaObject. */
    private representativeSegmentId : string;

    /** Reference to the actual MediaObject this container belongst to. */
    public mediaObject? : MediaObject;

    /**
     * Getter for the list of map for segment-scores.
     *
     * @returns {[segmentId : string] : SegmentScoreContainer}
     */
    public getSegmentScores() : Map<string, SegmentScoreContainer>  {
        return this.segmentScores;
    }

    /**
     * Number of segments for
     * @returns {MediaObject}
     */
    public getSegments() : number {
        return this.segmentScores.size;
    }

    /**
     * Getter for representativeSegmentId.
     *
     * @returns {string}
     */
    public getRepresentativeSegmentId() : string {
        return this.representativeSegmentId;
    }

    /**
     * Adds a MediaSegment to the MediaObjectContainer. That Segment is actually not
     * added to the container itself but to the respective SegmentScoreContainer (contained in
     * {segmentScores})
     *
     * @param segment MediaSegment to add.
     */
    public addMediaSegment(segment : MediaSegment) {
        if (!this.segmentScores.has(segment.segmentId))  this.segmentScores.set(segment.segmentId, new SegmentScoreContainer());
        this.segmentScores.get(segment.segmentId).mediaSegment = segment;
    }

    /**
     *
     * @param category
     * @param similarity
     */
    public addSimilarity(category : Feature, similarity : Similarity) {
        if (!this.segmentScores.has(similarity.key)) this.segmentScores.set(similarity.key, new SegmentScoreContainer());
        this.segmentScores.get(similarity.key).addSimilarity(category, similarity);
    }

    /**
     * Updates the features of this MediaObjectScoreContainer. Currently, the highest weight
     * of the hosted segments is used as weight!
     *
     * TODO: Check if maybe mean value would be better suited.
     *
     * @param features
     */
    public update() {
        this.score = 0;
        this.segmentScores.forEach((value : SegmentScoreContainer, key: string) => {
            value.update();
            let score = value.getScore();
            if (this.score < score) {
                this.score = score;
                this.representativeSegmentId = key;
            }
        });
    }

    /**
     * Method used by the UI/Template part. Can be used to determine whether this MediaObjectScoreContainer
     * is ready to be displayed.
     *
     * @returns {boolean} true if it can be displayed, false otherwise.
     */
    public show() : boolean {
        return this.mediaObject != undefined && this.representativeSegmentId != undefined;
    }
}