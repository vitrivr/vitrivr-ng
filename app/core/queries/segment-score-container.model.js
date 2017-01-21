"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var compound_score_container_model_1 = require("./compound-score-container.model");
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
}(compound_score_container_model_1.CompoundScoreContainer));
exports.SegmentScoreContainer = SegmentScoreContainer;
//# sourceMappingURL=segment-score-container.model.js.map