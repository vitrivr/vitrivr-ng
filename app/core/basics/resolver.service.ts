import {Injectable} from "@angular/core";
import {ConfigService} from "./config.service";
import {MediaObject} from "../../shared/model/media/media-object.model";
import {MediaSegment} from "../../shared/model/media/media-segment.model";


/**
 * This class can be used to resolve paths / URL's to media-objects (original file)
 * and previews / thumbnails.
 *
 * It's an injectable, singleton service of Vitrivr NG.
 */
@Injectable()
export class ResolverService {

    /**
     * Default constructor.
     *
     * @param _config ConfigService reference; injected.
     */
    constructor(private _config: ConfigService) {
    }

    /**
     * Resolves and returns the absolute path / URL to the thumbnail of a given
     * media-segment.
     *
     * @param objectId Object ID of the media-segment (or the media object the segment belongs to)
     * @param segmentId Segment ID of the media-segment
     */
    public pathToThumbnail(objectId: string, segmentId: string) {
        return this._config.host_thumbnails + objectId + "/" + segmentId + ".png";
    }

    /**
     * Resolves and returns the absolute path / URL to the thumbnail of a given
     * media segment.
     *
     * @param segment The MediaSegment for which to return the path to the thumbnail.
     */
    public pathToThumbnailForSegment(segment: MediaSegment) {
        return this.pathToThumbnail(segment.objectId, segment.segmentId);
    }

    /**
     * Resolves and returns the absolute path / URL to a media object.
     *
     * @param object The MediaObject for which to return the path.
     */
    public pathToObject(object: MediaObject) {
        return this._config.host_object + object.mediatype.toLowerCase() + "/" + object.path;
    }
}