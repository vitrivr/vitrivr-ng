/**
 * Interface for a MediaSegment type, which represents a subset of a particular media type
 * (e.g. a sequence of a video).
 */
export interface MediaSegment {
    segmentId : string,
    objectId : string, /* FK: Used to associate with MediaObject. */
    start : number,
    end : number,
    segmentnumber : number
}