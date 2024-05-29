import {Pipe, PipeTransform} from '@angular/core';
import {MediaObjectDescriptor, MediaSegmentDescriptor} from '../../../../../openapi/cineast';
import {ResolverService} from '../../../core/basics/resolver.service';
import {AppConfig} from '../../../app.config';

@Pipe({
  name: 'ThumbnailPathPipe'
})
export class ThumbnailPathPipe implements PipeTransform {
  private _host_thumbnails: string;
  private _schema: string = "LSC" // TODO config
  private _exporter: string = "thumbnail" // TODO config

  constructor(_configService: AppConfig, public readonly _resolverService: ResolverService) {
    _configService.configAsObservable.subscribe(c => this._host_thumbnails = c.engineEndpointRest)
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
  public transform(object: MediaObjectDescriptor, segment: MediaSegmentDescriptor, height?: number, width?: number): String {
    return `${this._host_thumbnails}/api/${this._schema}/fetch/${this._exporter}/${segment.segmentId}`
  }
}
