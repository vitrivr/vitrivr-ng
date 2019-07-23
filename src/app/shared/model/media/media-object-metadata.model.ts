/**
 * Interface for the MediaObjectMetadata type.
 */
export interface MediaObjectMetadata {
    objectId : string, /* FK: Used to associate with MediaObject. */
    domain : string, /* Domain of the metadata entry. */
    key : string, /* Named key identifying the metadata entry. */
    value : any /* Value; may be string, number, boolean... */
}