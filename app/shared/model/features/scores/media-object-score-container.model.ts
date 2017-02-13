
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
    private segmentScores : Map<string, SegmentScoreContainer> = new Map();

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
    public getRepresentativeSegment() : SegmentScoreContainer {
        let representativeSegment : SegmentScoreContainer;
        this.segmentScores.forEach((value, key) => {
            if (representativeSegment == undefined || representativeSegment.getScore() < value.getScore()) {
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
     * Updates the score of this MediaObjectScoreContainer.
     *
     * @param features List of feature categories that should be used to calculate the score.
     * @param func The weight function that should be used to calculate the score.
     */
    public update(features: Feature[], func: WeightFunction) {
        this.score = func.scoreForObject(features, this);
    }

    /**
     * Method used by the UI/Template part. Can be used to determine whether this MediaObjectScoreContainer
     * is ready to be displayed.
     *
     * @returns {boolean} true if it can be displayed, false otherwise.
     */
    public show() : boolean {
        return this.mediaObject != undefined && this.segmentScores.size > 0;
    }
}