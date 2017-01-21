/**
 * Interface for a Similarity type. Used to map JSON responses to object-representations.
 */
export interface Similarity {
    value : number, /* FK: Used to associate with MediaSegment. TODO: Naming (Java)! */
    key : string
}