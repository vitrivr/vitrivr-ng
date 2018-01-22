
import {SegmentScoreContainer} from "../model/features/scores/segment-score-container.model";

export class VideoUtil {

    /**
     * Calculates a best effort FPS value from the media segment's start and end. The resulting value ony makes sense for videos.
     *
     * @param {SegmentScoreContainer} _segment SegmentScoreContainer for whichto calculate the FPS value.
     * @return {number} FPS value.
     */
    static bestEffortFPS(_segment: SegmentScoreContainer) {
        return (_segment.mediaSegment.end - _segment.mediaSegment.start)/(_segment.mediaSegment.endabs - _segment.mediaSegment.startabs);
    }
}