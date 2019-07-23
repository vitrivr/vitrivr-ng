
import {SegmentScoreContainer} from "../model/results/scores/segment-score-container.model";

export class VideoUtil {
    /**
     * Calculates a best effort FPS value from the media segment's start and end. The resulting value ony makes sense for videos.
     *
     * @param {SegmentScoreContainer} _segment SegmentScoreContainer for whichto calculate the FPS value.
     * @return {number} FPS value.
     */
    static bestEffortFPS(_segment: SegmentScoreContainer) {
        return (_segment.end - _segment.start)/(_segment.endabs - _segment.startabs);
    }
}