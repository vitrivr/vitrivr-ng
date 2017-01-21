/**
 * Interface for a MediaSegment type, which represents a subset of a particular media type
 * (e.g. a sequence of a video).
 */
export interface MediaSegment {
    objectId : string, /* FK: Used to associate with MediaType. */
    segmentId : string,
    segmentstart : number,
    segmentend : number,
    segmentnumber : number
}