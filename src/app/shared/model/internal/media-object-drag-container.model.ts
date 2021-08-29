import {MediaObjectScoreContainer} from '../results/scores/media-object-score-container.model';
import {MediaObjectDescriptor} from '../../../../../openapi/cineast';

/**
 * This is an internal helper class used for Drag & Drop operatoin. It contains information on a dragged MediaObject.
 */
export class MediaObjectDragContainer {
  /** Format string used to identify drag objects. */
  public static FORMAT = 'application/vitrivr-mediaobject';

  /**
   * Creates a new MediaObjectDragContainer from a provided JSON string. The JSON must contain they
   * keys 'mediatype' and 'object'.
   *
   * @param {string} json JSON string that should be parsed.
   * @return {MediaObjectDragContainer} Resulting MediaObjectDragContainer.
   */
  public static fromJSON(json: string): MediaObjectDragContainer {
    const object = JSON.parse(json);
    return new MediaObjectDragContainer(object['mediatype'], object['object']);
  }

  /**
   * Creates a new MediaObjectDragContainer from a provided MediaObjectScoreContainer.
   *
   * @param {string} container MediaObjectScoreContainer from which to derive a MediaObjectDragContainer
   * @return {MediaObjectDragContainer} Resulting MediaObjectDragContainer.
   */
  public static fromScoreContainer(container: MediaObjectScoreContainer): MediaObjectDragContainer {
    return new MediaObjectDragContainer(container.mediatype, container);
  }

  public static fromDescriptor(descriptor: MediaObjectDescriptor): MediaObjectDragContainer {
    return new MediaObjectDragContainer(descriptor.mediatype, descriptor)
  }

  /**
   *
   * @param {MediaType} _mediatype The type of the MediaObject the provided segment belongs to.
   * @param {MediaSegment} _object The MediaObject packaged in this MediaObjectDragContainer
   */
  private constructor(private _mediatype: MediaObjectDescriptor.MediatypeEnum, private _object: MediaObjectDescriptor) {
  }

  /**
   * Getter for mediatype
   *
   * @return {MediaType}
   */
  get mediatype(): MediaObjectDescriptor.MediatypeEnum {
    return this._mediatype;
  }

  /**
   * Getter for object.
   *
   * @return {MediaObject}
   */
  get object(): MediaObjectDescriptor {
    return this._object;
  }

  /**
   * Converts the given MediaObjectDragContainer to a JSON string.
   *
   * @return {string} JSON string representing the MediaObjectDragContainer
   */
  public toJSON() {
    return JSON.stringify({mediatype: this._mediatype, object: this._object}, ['mediatype', 'object', 'objectId', 'mediatype', 'name', 'path', 'contentURL']);
  }
}
