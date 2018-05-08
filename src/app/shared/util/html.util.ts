import {SegmentScoreContainer} from "../model/results/scores/segment-score-container.model";

export class HtmlUtil {

    /** RegEx pattern used to test whether a string is a URL. */
    static URL_PATTERN = new RegExp('^(https?):\\/\\/((?:[a-z0-9.-]|%[0-9A-F]{2}){3,})(?::(\\d+))?((?:\\/(?:[a-z0-9-._~!$&\'()*+,;=:@]|%[0-9A-F]{2})*)*)(?:\\?((?:[a-z0-9-._~!$&\'()*+,;=:\\/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&\'()*+,;=:\\/?@]|%[0-9A-F]{2})*))?$','i');

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
}