/**
 * IMPORTANT: These interfaces define all the fields of the different entity types used by Vitrivr/Cineast. If you
 * add a field to any of these types please add them to this interface as well! The interfaces are used to map JSON
 * responses to object-representations.
 */

/**
 * Interface for a MediaObject type, which represents a file like a video, audio or 3D-model.
 */
export interface MediaObject {
    objectId : string,
    mediatype: MediaType,
    name : string,
    path : string,
}

/**
 * Interface for a MediaSegment type, which represents a subset of a particular media type
 * (e.g. a sequence of a video).
 */
export interface MediaSegment {
    objectId : string, /* FK: Used to associate with MediaType. */
    segmentId : string,
    start : number,
    end : number,
    number : number
}

/**
 * Interface for a Similarity type. Used to map JSON responses to object-representations.
 */
export interface Similarity {
    value : number, /* FK: Used to associate with MediaSegment. TODO: Naming (Java)! */
    key : string
}

/**
 * MediaType's currently supported by Vitrivr. Feel free to add to the list ;-)
 */
export type MediaType = "IMAGE" | "VIDEO" | "AUDIO" | "MODEL";