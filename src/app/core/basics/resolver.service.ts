import {Injectable} from '@angular/core';
import {MediaSegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {MediaObjectDescriptor, MediaSegmentDescriptor} from '../../../../openapi/cineast';
import {AppConfig} from '../../app.config';

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
  public static suffices: Map<MediaObjectDescriptor.MediatypeEnum, string> = new Map();

  /** The RegEx pattern used for replacement. */
  public static readonly _regex = new RegExp('(' + [
    Token.OBJECT_ID,
    Token.OBJECT_NAME,
    Token.OBJECT_PATH,
    Token.OBJECT_TYPE_LOWER,
    Token.OBJECT_TYPE_UPPER,
    Token.SEGMENT_ID,
    Token.SEGMENT_ID_NO_PREFIX,
    Token.SUFFIX
  ].join('|') + ')', 'g');

  /** Host string used when resolving URL's to thumbnails. */
  private host_thumbnails: string;

  /** Host string used when resolving URL's to objects. */
  private host_objects: string;

  public static prefixForMediatype(mediatype: MediaObjectDescriptor.MediatypeEnum) {
    switch (mediatype) {
      case MediaObjectDescriptor.MediatypeEnum.Audio:
        return 'a_';
      case MediaObjectDescriptor.MediatypeEnum.Image:
        return 'i_';
      case MediaObjectDescriptor.MediatypeEnum.ImageSequence:
        return 'is_';
      case MediaObjectDescriptor.MediatypeEnum.Model3D:
        return 'm_';
      case MediaObjectDescriptor.MediatypeEnum.Video:
        return 'v_';
      default:
        return '';
    }
  }

  /**
   * Resolves and returns the IIIF Resource URL to a MediaObject.
   *
   * @param object The MediaObject for which to return the URL.
   * @param rawPath Set to true if raw base URL is required without any parameters appended to it
   * @param height Optional height parameter to control the dimensions of the image
   * @param width Optional width parameter to control the dimensions of the image
   */
  public static iiifUrlToObject(object: MediaObjectDescriptor, rawPath?: boolean, height?: number, width?: number): string {
    // @ts-ignore
    const metadata = object.metadata
    if (!metadata) {
      return null
    }
    let baseUrl = metadata.get('IIIF.resourceUrl')
    if (!(baseUrl == null || baseUrl.trim().length === 0)) {
      if (!baseUrl.endsWith('/')) {
        baseUrl = baseUrl.concat('/')
      }
      if (!rawPath) {
        const xWidth = width ? width : ''
        const yHeight = height ? height : ''
        const domain = 'IIIF'
        const size = (height || width) ? (xWidth + ',' + yHeight) : (metadata.get(domain + '.size') || 'full')
        const region = metadata.get(domain + '.region') || 'full'
        const rotation = metadata.get(domain + '.rotation') || '0'
        const quality = metadata.get(domain + '.quality') || 'default'
        const extension = metadata.get(domain + '.extension') || 'jpg'
        baseUrl = baseUrl.concat(`${region}/${size}/${rotation}/${quality}.${extension}`)
      }
      return baseUrl
    }
    return null
  }

  /**
   * Default constructor; Initializes the map of suffixes per media-type based on
   * the configuration.
   *
   * @param _configService ConfigService reference; injected.
   */
  constructor(_configService: AppConfig) {
    _configService.configAsObservable.subscribe((config) => {
      this.host_thumbnails = config.get('resources.host_thumbnails');
      this.host_objects = config.get('resources.host_objects');
      const default_suffix: string = config.get('resources.suffix_default');
      const suffices = config.get('resources.suffix');
      for (const type of Object.keys(MediaObjectDescriptor.MediatypeEnum).map(key => MediaObjectDescriptor.MediatypeEnum[key])) {
        const suffix: string = suffices[type];
        if (typeof suffix === 'string') {
          ResolverService.suffices.set(type, (suffix.charAt(0) === '.' ? '' : '.') + suffix);
        } else {
          ResolverService.suffices.set(type, (default_suffix.charAt(0) === '.' ? '' : '.') + default_suffix);
        }
      }
    });
  }

  /**
   * Resolves and returns the absolute path / URL to a MediaObject.
   *
   * @param object The MediaObject for which to return the path.
   */
  public pathToObject(object: MediaObjectDescriptor) {
    const iiifUrl = ResolverService.iiifUrlToObject(object)
    if (iiifUrl) {
      return iiifUrl
    }
    const rep = {};
    rep[Token.OBJECT_ID] = object.objectid;
    rep[Token.OBJECT_NAME] = object.name;
    rep[Token.OBJECT_PATH] = object.path;
    rep[Token.OBJECT_TYPE_LOWER] = object.mediatype.toLowerCase();
    rep[Token.OBJECT_TYPE_UPPER] = object.mediatype;
    rep[Token.SUFFIX] = ResolverService.suffices.get(object.mediatype);
    return this.host_objects.replace(ResolverService._regex, (match) => rep[match] || match);
  }

  /**
   * Resolves and returns the absolute path / URL to the thumbnail of a given combination of MediaSegment and MediaObject.
   * If an IIIF resource URL is available then it is returned instead of the absolute path.
   *
   * @param {object} object The MediaObject for which to return the path / URL
   * @param {segment} segment The MediaSegment for which to return the path / URL
   * @param height Optional height parameter to control the height parameter in the IIIF Image API URL
   * @param width Optional width parameter to control the width parameter in the IIIF Image API URL
   * @return {string}
   */
  public pathToThumbnail(object: MediaObjectDescriptor, segment: MediaSegmentDescriptor, height?: number, width?: number) {
    const iiifUrl = ResolverService.iiifUrlToObject(object, false, height, width);
    if (iiifUrl) {
      return iiifUrl
    }
    const rep = {};
    rep[Token.OBJECT_ID] = object.objectid;
    rep[Token.OBJECT_NAME] = object.name;
    rep[Token.OBJECT_PATH] = object.path;
    rep[Token.OBJECT_TYPE_LOWER] = object.mediatype.toLowerCase();
    rep[Token.OBJECT_TYPE_UPPER] = object.mediatype;
    rep[Token.SUFFIX] = ResolverService.suffices.get(object.mediatype);
    rep[Token.SEGMENT_ID] = segment.segmentId;
    return this.host_thumbnails.replace(ResolverService._regex, (match) => rep[match] || match);
  }

  public pathToSegment(segment: MediaSegmentScoreContainer) {
    const rep = {};
    rep[Token.OBJECT_ID] = segment.objectScoreContainer.objectid;
    rep[Token.OBJECT_NAME] = segment.objectScoreContainer.name;
    rep[Token.OBJECT_PATH] = segment.objectScoreContainer.path;
    rep[Token.OBJECT_TYPE_LOWER] = segment.objectScoreContainer.mediatype.toLowerCase();
    rep[Token.OBJECT_TYPE_UPPER] = segment.objectScoreContainer.mediatype;
    rep[Token.SUFFIX] = ResolverService.suffices.get(segment.objectScoreContainer.mediatype);
    rep[Token.SEGMENT_ID] = segment.segmentId;
    rep[Token.SEGMENT_ID_NO_PREFIX] = segment.segmentId.replace(ResolverService.prefixForMediatype(segment.objectScoreContainer.mediatype), '');
    return this.host_objects.replace(ResolverService._regex, (match) => rep[match] || match);
  }
}
