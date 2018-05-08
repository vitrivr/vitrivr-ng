import {SegmentScoreContainer} from "../model/results/scores/segment-score-container.model";

export class HtmlUtil {
    /** RegEx pattern used to test whether a string is a URL. */
    static URL_PATTERN = new RegExp('((([A-Za-z]{3,9}:(?:\\/\\/)?)(?:[-;:&=\\+\\$,\\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\\+\\$,\\w]+@)[A-Za-z0-9.-]+)((?:\\/[\\+~%\\/.\\w-_]*)?\\??(?:[-\\+=&;%@.\\w_]*)#?(?:[\\w]*))?)'))?','ig');

    /**
     * Calculates a best effort FPS value from the media segment's start and end. The resulting value ony makes sense for videos.
     *
     * @param {SegmentScoreContainer} _segment SegmentScoreContainer for whichto calculate the FPS value.
     * @return {number} FPS value.
     */
    static bestEffortFPS(_segment: SegmentScoreContainer) {
        return (_segment.mediaSegment.end - _segment.mediaSegment.start)/(_segment.mediaSegment.endabs - _segment.mediaSegment.startabs);
    }

    /**
     * Returns true if the passed string is a URL and false otherwise.
     *
     * @param {string} str String that should be tested.
     * @return {boolean}
     */
    static isUrl(str: string): boolean {
        return HtmlUtil.URL_PATTERN.test(str);
    }

    /**
     * Replaces all URL occurences in the provided string by a <a href=""></a>
     *
     * @param {string} str String that should be replaced.
     * @param {target} str The target for the href (e.g. _blank).
     * @return {boolean}
     */
    static replaceUrlByLink(str: string, target: string = null): string {
        if (target) {
            return str.replace(HtmlUtil.URL_PATTERN, "<a href='$1' target='" + target + "'>$1</a>");
        } else {
            return str.replace(HtmlUtil.URL_PATTERN, "<a href='$1'>$1</a>");
        }
    }
}