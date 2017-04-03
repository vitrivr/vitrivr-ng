/**
 * IMPORTANT: Interfaces in this folder define all entities used by Vitrivr/Cineast. If you
 * add a field to any of these types please add them to this interface as well! The interfaces are used to map JSON
 * responses to object-representations.
 */


/**
 * MediaType's currently supported by Vitrivr. Feel free to add to the list ;-)
 */
export type MediaType = "IMAGE" | "VIDEO" | "AUDIO" | "MODEL3D";


/**
 * Interface for a MediaObject type, which represents a file like a video, audio or 3D-model.
 */
export interface MediaObject {
    objectId : string,
    mediatype: MediaType,
    name : string,
    path : string,
}