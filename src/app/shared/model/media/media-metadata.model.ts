/**
 * Interface for the MediaMetadata type.
 */
export interface MediaMetadata {
    objectId : string, /* FK: Used to associate with MediaObject. */
    domain : string, /* Domain of the metadata entry. */
    key : string, /* Named key identifying the metadata entry. */
    value : any /* Value; may be string, number, boolean... */
}