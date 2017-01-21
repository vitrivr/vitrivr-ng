"use strict";
/**
 * This class defines an abstract container for compound scores, i.e. scores that are obtained as a result of multiple
 * sub-scores. It defines some basic methods that can be invoked for such a CompoundScoreContainer.
 *
 * Note: The class is used to build a ScoreContainer hierarchy for research-results returned by Cineast. For every MediaObject
 * (e.g. a video) a MediaObjectScoreContainer is created. That container in turn hosts a list of SegmentScoreContainer's,
 * which again host a set of Similarity objects (raw scores).
 *
 * Both containers are able to derive a score for themselves based on the sub-entities they host. These scores are used
 * to rank the research-results in the UI.
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
//# sourceMappingURL=compound-score-container.model.js.map