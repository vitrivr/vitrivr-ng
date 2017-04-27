/**
 * Defines the MediaTypes used by VitrivrNG. Feel free to add new types.
 */
export type MediaType = "IMAGE" | "VIDEO" | "AUDIO" | "MODEL3D";

/**
 * Array containing all defined media types. This is for convenience only! The values in this
 * array MUST correspond with the values in the MediaType type.
 *
 * @type {[MediaType,MediaType,MediaType,MediaType]}
 */
export let MediaTypes : MediaType[] = ["IMAGE", "VIDEO", "AUDIO", "MODEL3D"];