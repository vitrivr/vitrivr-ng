import {Pipe, PipeTransform} from '@angular/core';
import {MediaObjectDescriptor, MediaSegmentDescriptor} from '../../../../../openapi/cineast';
import {ResolverService} from '../../../core/basics/resolver.service';
import {AppConfig} from "../../../app.config";

@Pipe({
  name: 'ObjectPathPipe'
})
export class ObjectPathPipe implements PipeTransform {
  private _host_video: string;
  private _schema: string = ""
  constructor(_configService: AppConfig, public readonly _resolverService: ResolverService) {
    _configService.configAsObservable.subscribe(c => {
      this._host_video = c.videoEndpoint;
      this._schema = c.schema;
    })
  }

  /**
   * Resolves and returns the absolute path / URL to a MediaObject.
   *
   * @param object The MediaObject for which to return the path.
   */
  public transform(object: MediaObjectDescriptor): String {
    const n = object.path.lastIndexOf('/');
    var name = object.path.substring(n + 1)
    return `${this._host_video}/${this._schema}/${name}`//this._resolverService.pathToObject(object)
  }
}
