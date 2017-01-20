"use strict";
var Query = (function () {
    function Query() {
        this.messagetype = "Q_QUERY";
        this.containers = [];
        this.types = [];
    }
    return Query;
}());
exports.Query = Query;
var ImageQueryTerm = (function () {
    function ImageQueryTerm() {
        this.categories = ['globalcolor'];
    }
    ImageQueryTerm.prototype.setting = function (setting) {
        switch (setting) {
            case 0:
                this.categories = ['globalcolor'];
                break;
            case 1:
                this.categories = ['globalcolor', 'localcolor'];
                break;
            case 3:
                this.categories = ['globalcolor', 'localcolor', 'edge'];
                break;
            case 4:
                this.categories = ['globalcolor', 'localcolor', 'edge', 'poi'];
                break;
            default:
                this.categories = ['globalcolor'];
                break;
        }
    };
    return ImageQueryTerm;
}());
exports.ImageQueryTerm = ImageQueryTerm;
var QueryContainer = (function () {
    function QueryContainer() {
    }
    return QueryContainer;
}());
exports.QueryContainer = QueryContainer;
//# sourceMappingURL=query.types.js.map