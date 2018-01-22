import {MediaType} from "../media/media-type.model";
import {MediaSegment} from "../media/media-segment.model";
import {SegmentScoreContainer} from "../features/scores/segment-score-container.model";

/**
 * This is an internal helper class used for Drag & Drop operatoin. It contains information on a dragged MediaSegment.
 */
export class MediaSegmentDragContainer {
    /** Format string used to identify drag objects. */
    public static FORMAT = "application/vitrivr-mediasegment";

    /**
     *
     * @param {MediaType} _mediatype The type of the MediaObject the provided segment belongs to.
     * @param {MediaSegment} _segment The MediaSegment packaged in this MediaSegmentDragContainer
     */
    private constructor(private _mediatype: MediaType, private _segment: MediaSegment) {
    }

    /**
     * Getter for mediatype
     *
     * @return {MediaType}
     */
    get mediatype(): MediaType {
        return this._mediatype;
    }

    /**
     * Getter for segment.
     *
     * @return {MediaSegment}
     */
    get segment(): MediaSegment {
        return this._segment;
    }

    /**
     * Converts the given MediaSegmentDragContainer to a JSON string.
     *
     * @return {string} JSON string representing the MediaSegmentDragContainer
     */
    public toJSON() {
        return JSON.stringify({mediatype: this.mediatype, segment: this.segment})
    }

    /**
     * Creates a new MediaSegmentDragContainer from a provided JSON string. The JSON must contain they
     * keys 'mediatype' and 'segment'.
     *
     * @param {string} json JSON string that should be parsed.
     * @return {MediaSegmentDragContainer} Resulting MediaSegmentDragContainer.
     */
    public static fromJSON(json: string): MediaSegmentDragContainer {
       let object = JSON.parse(json);
       return new MediaSegmentDragContainer(object["mediatype"], object["segment"]);
    }

    /**
     * Creates a new MediaSegmentDragContainer from a provided SegmentScoreContainer.
     *
     * @param {string} json JSON string that should be parsed.
     * @return {MediaSegmentDragContainer} Resulting MediaSegmentDragContainer.
     */
    public static fromScoreContainer(container: SegmentScoreContainer): MediaSegmentDragContainer {
        return new MediaSegmentDragContainer(container.objectScoreContainer.mediatype, container.mediaSegment);
    }
}