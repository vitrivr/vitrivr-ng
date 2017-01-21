"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var compound_score_container_model_1 = require("./compound-score-container.model");
var segment_score_container_model_1 = require("./segment-score-container.model");
/**
 * The MediaObjectScoreContainer is a CompoundScoreContainer for MediaObjects. It is associated with
 * a single MediaObject (e.g. a video, audio or 3d-model file) and holds the score for that object. That
 * score is determined by the scores of the SegmentScoreContainers hosted by a concrete instance of this class.
 */
var MediaObjectScoreContainer = (function (_super) {
    __extends(MediaObjectScoreContainer, _super);
    function MediaObjectScoreContainer() {
        _super.apply(this, arguments);
        /** Map of SegmentScoreContainer for all the SegmentObject's that belong to this MediaObject. */
        this.segmentScores = new Map();
    }
    /**
     * Getter for the list of map for segment-scores.
     *
     * @returns {[segmentId : string] : SegmentScoreContainer}
     */
    MediaObjectScoreContainer.prototype.getSegmentScores = function () {
        return this.segmentScores;
    };
    /**
     * Number of segments for
     * @returns {MediaObject}
     */
    MediaObjectScoreContainer.prototype.getSegments = function () {
        return this.segmentScores.size;
    };
    /**
     * Getter for representativeSegmentId.
     *
     * @returns {string}
     */
    MediaObjectScoreContainer.prototype.getRepresentativeSegmentId = function () {
        return this.representativeSegmentId;
    };
    /**
     * Adds a MediaSegment to the MediaObjectContainer. That Segment is actually not
     * added to the container itself but to the respective SegmentScoreContainer (contained in
     * {segmentScores})
     *
     * @param segment MediaSegment to add.
     */
    MediaObjectScoreContainer.prototype.addMediaSegment = function (segment) {
        if (!this.segmentScores.has(segment.segmentId))
            this.segmentScores.set(segment.segmentId, new segment_score_container_model_1.SegmentScoreContainer());
        this.segmentScores.get(segment.segmentId).mediaSegment = segment;
    };
    /**
     *
     * @param category
     * @param similarity
     */
    MediaObjectScoreContainer.prototype.addSimilarity = function (category, similarity) {
        if (!this.segmentScores.has(similarity.key))
            this.segmentScores.set(similarity.key, new segment_score_container_model_1.SegmentScoreContainer());
        this.segmentScores.get(similarity.key).addSimilarity(category, similarity);
        this.update();
    };
    /**
     * Updates the weights of this MediaObjectScoreContainer. Currently, the highest weight
     * of the hosted segments is used as weight!
     *
     * TODO: Check if maybe mean value would be better suited.
     *
     * @param weights
     */
    MediaObjectScoreContainer.prototype.update = function (weights) {
        this.score = 0;
        this.segmentScores.forEach(function (value, key) {
            var score = value.getScore();
            if (this.score < score) {
                this.score = score;
                this.representativeSegmentId = key;
            }
        }.bind(this));
    };
    /**
     * Method used by the UI/Template part. Can be used to determine whether this MediaObjectScoreContainer
     * is ready to be displayed.
     *
     * @returns {boolean} true if it can be displayed, false otherwise.
     */
    MediaObjectScoreContainer.prototype.show = function () {
        return this.mediaObject != undefined && this.segmentScores.size > 0;
    };
    return MediaObjectScoreContainer;
}(compound_score_container_model_1.CompoundScoreContainer));
exports.MediaObjectScoreContainer = MediaObjectScoreContainer;
//# sourceMappingURL=media-object-score-container.model.js.map