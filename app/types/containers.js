"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * This class defines an abstract container for compound scores, i.e. scores that are obtained as a result of multiple
 * sub-scores. It defines some basic methods that can be invoked for such a CompoundScoreContainer.
 *
 * Note: The class is used to build a ScoreContainer hierarchy for query-results returned by Cineast. For every MediaObject
 * (e.g. a video) a MediaObjectScoreContainer is created. That container in turn hosts a list of SegmentScoreContainer's,
 * which again host a set of Similarity objects (raw scores).
 *
 * Both containers are able to derive a score for themselves based on the sub-entities they host. These scores are used
 * to rank the query-results in the UI.
 */
var CompoundScoreContainer = (function () {
    function CompoundScoreContainer() {
        /** Score value. How it is obtained is up to the implementing class. */
        this.score = 0;
    }
    /**
     * Getter for the container's score.
     */
    CompoundScoreContainer.prototype.getScore = function () {
        return this.score;
    };
    ;
    /**
     * Getter for the container's score as percent value.
     */
    CompoundScoreContainer.prototype.getScorePercentage = function () {
        return Math.round(this.getScore() * 1000) / 10;
    };
    /**
     * Static comparator method. Compares two ScoreContainers so that they
     * are sorted in a descending order. Can be used with Array.prototype.sort();
     */
    CompoundScoreContainer.compareDesc = function (a, b) {
        if (a.getScore() < b.getScore()) {
            return -1;
        }
        if (a.getScore() > b.getScore()) {
            return 1;
        }
        return 0;
    };
    /**
     * Static comparator method. Compares two ScoreContainers so that they
     * are sorted in a ascending order. Can be used with Array.prototype.sort();
     */
    CompoundScoreContainer.compareAsc = function (a, b) {
        if (a.getScore() > b.getScore()) {
            return -1;
        }
        if (a.getScore() < b.getScore()) {
            return 1;
        }
        return 0;
    };
    return CompoundScoreContainer;
}());
exports.CompoundScoreContainer = CompoundScoreContainer;
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
            this.segmentScores.set(segment.segmentId, new SegmentScoreContainer());
        this.segmentScores.get(segment.segmentId).mediaSegment = segment;
    };
    /**
     *
     * @param category
     * @param similarity
     */
    MediaObjectScoreContainer.prototype.addSimilarity = function (category, similarity) {
        if (!this.segmentScores.has(similarity.key))
            this.segmentScores.set(similarity.key, new SegmentScoreContainer());
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
}(CompoundScoreContainer));
exports.MediaObjectScoreContainer = MediaObjectScoreContainer;
/**
 * The SegmentScoreContainer is a CompoundScoreContainer for MediaSegments. It is associated with
 * a single segment (e.g. a shot of a video) and holds the score for that segment. That
 * score is determined by the actual scores of the segment (per category).
 */
var SegmentScoreContainer = (function (_super) {
    __extends(SegmentScoreContainer, _super);
    function SegmentScoreContainer() {
        _super.apply(this, arguments);
        /** List of scores. Entries should correspond to those in the array categories. */
        this.scores = new Map();
        /** List of weights. Entries should correspond to categories in the array scores. */
        this.weights = new Map();
    }
    /**
     * Adds a similarity object to this SegmentScoreContainer by pushing the category and
     * the actual value to their respective arrays.
     *
     * Note: Causes an update of the score value.
     *
     * @param category
     * @param similarity
     */
    SegmentScoreContainer.prototype.addSimilarity = function (category, similarity) {
        this.scores.set(category, similarity.value);
        this.weights.set(category, 0);
        var weight = 1 / this.weights.size;
        this.weights.forEach(function (value, key) {
            this.weights.set(key, weight);
        }.bind(this));
        this.update();
    };
    /**
     * Updates the score value by weighing the scores in the array scores by the weight
     * associated in the weights objects. If no such object was defined, all values are
     * weighted equally.
     *
     * @param weights
     */
    SegmentScoreContainer.prototype.update = function (weights) {
        this.score = 0;
        if (weights == undefined)
            weights = this.weights;
        this.scores.forEach(function (value, key) {
            this.score += value * weights.get(key);
        }.bind(this));
    };
    return SegmentScoreContainer;
}(CompoundScoreContainer));
exports.SegmentScoreContainer = SegmentScoreContainer;
//# sourceMappingURL=containers.js.map