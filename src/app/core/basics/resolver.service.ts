import {Injectable} from '@angular/core';
import {ConfigService} from './config.service';
import {MediaType, MediaTypes} from '../../shared/model/media/media-type.model';
import {SegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {MediaObject} from '../../shared/model/media/media-object.model';
import {MediaSegment} from '../../shared/model/media/media-segment.model';

/**
 * Definition of the possible tokens that can be used to build the URL.
 */
enum Token {
  OBJECT_ID = ':o',  /* The ID of the media object. */
  OBJECT_NAME = ':n',  /* The file name of the media object. */
  OBJECT_PATH = ':p', /* The path of the media object. */
  OBJECT_TYPE_LOWER = ':t', /* The object's media type in lowercase letters.*/
  OBJECT_TYPE_UPPER = ':T', /* The object's media type in uppercase letters.*/
  SEGMENT_ID = ':s',  /* ID of the media segment .*/
  SEGMENT_ID_NO_PREFIX = ':S',  /* ID of the media segment .*/
  SUFFIX = ':x' /* Suffix of the thumbnail file as defined in the config.*/
}

/**
 * This class can be used to resolve paths / URL's to media-objects (original file)
 * and previews / thumbnails. It's an injectable, singleton service of Vitrivr NG.
 */
@Injectable()
export class ResolverService {
  /** A map containing the definition of file-suffices for thumbnails per mediatype */
  private suffices: Map<MediaType, string> = new Map();

  /** Host string used when resolving URL's to thumbnails. */
  private host_thumbnails: string;

  /** Host string used when resolving URL's to objects. */
  private host_objects: string;

  /** The RegEx pattern used for replacement. */
  private _regex = new RegExp('(' + [
    Token.OBJECT_ID,
    Token.OBJECT_NAME,
    Token.OBJECT_PATH,
    Token.OBJECT_TYPE_LOWER,
    Token.OBJECT_TYPE_UPPER,
    Token.SEGMENT_ID,
    Token.SEGMENT_ID_NO_PREFIX,
    Token.SUFFIX
  ].join('|') + ')', 'g');

  /**
   * Default constructor; Initializes the map of suffixes per media-type based on
   * the configuration.
   *
   * @param _configService ConfigService reference; injected.
   */
  constructor(_configService: ConfigService) {
    _configService.asObservable().subscribe((config) => {
      this.host_thumbnails = config.get('resources.host_thumbnails');
      this.host_objects = config.get('resources.host_objects');
      let default_suffix: string = config.get('resources.suffix_default');
      let suffices = config.get('resources.suffix');
      for (let type of MediaTypes) {
        let suffix: string = suffices[type];
        if (typeof suffix == 'string') {
          this.suffices.set(type, (suffix.charAt(0) == '.' ? '' : '.') + suffix);
        } else {
          this.suffices.set(type, (default_suffix.charAt(0) == '.' ? '' : '.') + default_suffix);
        }
      }
    });
  }

  /**
   * Resolves and returns the absolute path / URL to a MediaObject.
   *
   * @param object The MediaObject for which to return the path.
   */
  public pathToObject(object: MediaObject) {
    let rep = {};
    rep[Token.OBJECT_ID] = object.objectId;
    rep[Token.OBJECT_NAME] = object.name;
    rep[Token.OBJECT_PATH] = object.path;
    rep[Token.OBJECT_TYPE_LOWER] = object.mediatype.toLowerCase();
    rep[Token.OBJECT_TYPE_UPPER] = object.mediatype;
    rep[Token.SUFFIX] = this.suffices.get(object.mediatype);
    return this.host_objects.replace(this._regex, (match) => rep[match] || match);
  }

  /**
   * Resolves and returns the absolute path / URL to the thumbnail of a given combination of MediaSegment and MediaObject.
   *
   * @param {MediaObject} object The MediaObject for which to return the path / URL
   * @param {MediaSegment} segment The MediaSegment for which to return the path / URL
   * @return {string}
   */
  public pathToThumbnail(object: MediaObject, segment: MediaSegment) {
    let rep = {};
    rep[Token.OBJECT_ID] = object.objectId;
    rep[Token.OBJECT_NAME] = object.name;
    rep[Token.OBJECT_PATH] = object.path;
    rep[Token.OBJECT_TYPE_LOWER] = object.mediatype.toLowerCase();
    rep[Token.OBJECT_TYPE_UPPER] = object.mediatype;
    rep[Token.SUFFIX] = this.suffices.get(object.mediatype);
    rep[Token.SEGMENT_ID] = segment.segmentId;
    return this.host_thumbnails.replace(this._regex, (match) => rep[match] || match);
  }

  public pathToSegment(segment: SegmentScoreContainer) {
    let rep = {};
    rep[Token.OBJECT_ID] = segment.objectScoreContainer.objectId;
    rep[Token.OBJECT_NAME] = segment.objectScoreContainer.name;
    rep[Token.OBJECT_PATH] = segment.objectScoreContainer.path;
    rep[Token.OBJECT_TYPE_LOWER] = segment.objectScoreContainer.mediatype.toLowerCase();
    rep[Token.OBJECT_TYPE_UPPER] = segment.objectScoreContainer.mediatype;
    rep[Token.SUFFIX] = this.suffices.get(segment.objectScoreContainer.mediatype);
    rep[Token.SEGMENT_ID] = segment.segmentId;
    rep[Token.SEGMENT_ID_NO_PREFIX] = segment.segmentId.replace(ResolverService.prefixForMediatype(segment.objectScoreContainer.mediatype), '');
    return this.host_objects.replace(this._regex, (match) => rep[match] || match);
  }


  private static prefixForMediatype(mediatype: MediaType) {
    switch (mediatype) {
      case 'AUDIO':
        return 'a_';
      case 'IMAGE':
        return 'i_';
      case 'IMAGE_SEQUENCE':
        return 'is_';
      case 'MODEL3D':
        return 'm_';
      case 'VIDEO':
        return 'v_';
      default:
        return '';
    }
  }
}
