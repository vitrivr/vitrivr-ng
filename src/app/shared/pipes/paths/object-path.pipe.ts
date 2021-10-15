import {Pipe, PipeTransform} from '@angular/core';
import {MediaObjectDescriptor, MediaSegmentDescriptor} from '../../../../../openapi/cineast';
import {ResolverService} from '../../../core/basics/resolver.service';

@Pipe({
  name: 'ObjectPathPipe'
})
export class ObjectPathPipe implements PipeTransform {

  constructor(public readonly _resolverService: ResolverService) {
  }

  /**
   * Resolves and returns the absolute path / URL to a MediaObject.
   *
   * @param object The MediaObject for which to return the path.
   */
  public transform(object: MediaObjectDescriptor): String {
    return this._resolverService.pathToObject(object)
  }
}
