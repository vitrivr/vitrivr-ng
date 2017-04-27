import {Injectable} from "@angular/core";
import {ConfigService} from "./config.service";
import {MediaObject} from "../../shared/model/media/media-object.model";
import {MediaSegment} from "../../shared/model/media/media-segment.model";
import {MediaType, MediaTypes} from "../../shared/model/media/media-type.model";

/**
 * This class can be used to resolve paths / URL's to media-objects (original file)
 * and previews / thumbnails. It's an injectable, singleton service of Vitrivr NG.
 */
@Injectable()
export class ResolverService {
    /** Name of the sub-folder that holds the segment thumbnails. */
    private static THUMBNAILS_FOLDER_NAME : string = "thumbnails";

    /** Name of the sub-folder that holds the actual media objects. */
    private static OBJECTS_FOLDER_NAME : string = "objects";

    /** A map containing the definition of file-suffices for thumbnails per mediatype */
    private suffices : Map<MediaType, string> = new Map();

    /**
     * Default constructor; Initializes the map of suffixes per media-type based on
     * the configuration.
     *
     * @param _config ConfigService reference; injected.
     */
    constructor(private _config: ConfigService) {
        let def = _config.suffix_default;
        let suffices = _config.suffix;
        for (let type of MediaTypes) {
            let suffix: string = suffices[type];
            if (typeof suffix == "string") {
                this.suffices.set(type, (suffix.charAt(0) == "." ? "" : ".") + suffix);
            } else {
                this.suffices.set(type, (def.charAt(0) == "." ? "" : ".") + def);
            }
        }
    }

    /**
     * Resolves and returns the absolute path / URL to the thumbnail of a given
     * media-segment.
     * @param mediatype Mediatype of the object the segment belongs to.
     * @param objectId Object ID of the media-segment (or the media object the segment belongs to)
     * @param segmentId Segment ID of the media-segment
     */
    public pathToThumbnail(mediatype: MediaType, objectId: string, segmentId: string) {
        let suffix = this.suffices.get(mediatype);
        if (this._config.host_thumbnails.endsWith("/")) {
            return this._config.host_thumbnails + ResolverService.THUMBNAILS_FOLDER_NAME + "/" + mediatype.toLowerCase() + "/" + objectId + "/" + segmentId + suffix;
        } else {
            return this._config.host_thumbnails + "/" + ResolverService.THUMBNAILS_FOLDER_NAME + "/" + mediatype.toLowerCase() + "/" + objectId + "/" + segmentId + suffix;
        }
    }

    /**
     * Resolves and returns the absolute path / URL to the thumbnail of a given
     * media segment.
     *
     * @param mediatype Mediatype of the object the segment belongs to.
     * @param segment The MediaSegment for which to return the path to the thumbnail.
     */
    public pathToThumbnailForSegment(mediatype: MediaType, segment: MediaSegment) {
        return this.pathToThumbnail(mediatype, segment.objectId, segment.segmentId);
    }

    /**
     * Resolves and returns the absolute path / URL to a media object.
     *
     * @param object The MediaObject for which to return the path.
     */
    public pathToObject(object: MediaObject) {
        if (this._config.host_object.endsWith("/")) {
            return this._config.host_object + ResolverService.OBJECTS_FOLDER_NAME + "/" + object.mediatype.toLowerCase() + "/" + object.path;
        } else {
            return this._config.host_object + "/" + ResolverService.OBJECTS_FOLDER_NAME + "/" + object.mediatype.toLowerCase() + "/" + object.path;
        }
    }
}