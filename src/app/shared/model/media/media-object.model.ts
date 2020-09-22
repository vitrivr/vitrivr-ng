import {MediaType} from './media-type.model';

/**
 * Interface for a MediaObject type, which represents a file like a video, audio or 3D-model.
 */
export interface MediaObject {
  objectId: string,
  mediatype: MediaType,
  name: string,
  path: string,
  contentURL: string
}
