/**
 * Interface for the MediaObjectMetadata type.
 */
export interface MediaSegmentMetadata {
    objectId : string, /* FK: Used to associate with MediaObject. */
    segmentId : string, /* FK: Used to associate with MediaSegment. */
    domain : string, /* Domain of the metadata entry. */
    key : string, /* Named key identifying the metadata entry. */
    value : any /* Value; may be string, number, boolean... */
}