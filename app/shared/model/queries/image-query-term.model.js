"use strict";
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
                this.categories = ['poi'];
                break;
            default:
                this.categories = ['globalcolor'];
                break;
        }
    };
    return ImageQueryTerm;
}());
exports.ImageQueryTerm = ImageQueryTerm;
//# sourceMappingURL=image-query-term.model.js.map