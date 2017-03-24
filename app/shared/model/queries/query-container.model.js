"use strict";
var image_query_term_model_1 = require("./image-query-term.model");
var audio_query_term_model_1 = require("./audio-query-term.model");
var m3d_query_term_model_1 = require("./m3d-query-term.model");
var QueryContainer = (function () {
    function QueryContainer() {
        /**
         *
         * @type {Array}
         */
        this._terms = new Map();
        /**
         *
         * @type {Array}
         */
        this.terms = [];
    }
    /**
     *
     * @param type
     */
    QueryContainer.prototype.addTerm = function (type) {
        if (this._terms.has(type))
            return false;
        switch (type) {
            case "IMAGE":
                this._terms.set(type, new image_query_term_model_1.ImageQueryTerm());
                break;
            case "AUDIO":
                this._terms.set(type, new audio_query_term_model_1.AudioQueryTerm());
                break;
            case "MODEL":
                this._terms.set(type, new m3d_query_term_model_1.M3DQueryTerm());
                break;
            default:
                return false;
        }
        this.terms.push(this._terms.get(type));
        return true;
    };
    /**
     *
     * @param type
     * @returns {boolean}
     */
    QueryContainer.prototype.removeTerm = function (type) {
        if (this._terms.has(type)) {
            this.terms.splice(this.terms.indexOf(this._terms.get(type)), 1);
            return this._terms.delete(type);
        }
    };
    /**
     *
     * @param type
     * @returns {boolean}
     */
    QueryContainer.prototype.hasTerm = function (type) {
        return this._terms.has(type);
    };
    /**
     *
     * @param type
     * @returns {boolean}
     */
    QueryContainer.prototype.getTerm = function (type) {
        return this._terms.get(type);
    };
    return QueryContainer;
}());
exports.QueryContainer = QueryContainer;
//# sourceMappingURL=query-container.model.js.map