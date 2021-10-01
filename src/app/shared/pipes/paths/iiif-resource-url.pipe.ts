import {Pipe, PipeTransform} from '@angular/core';
import {MediaObjectDescriptor, MediaSegmentDescriptor} from '../../../../../openapi/cineast';
import {ResolverService} from '../../../core/basics/resolver.service';

@Pipe({
  name: 'IiifResourceUrlPipe'
})
export class IiifResourceUrlPipe implements PipeTransform {

  /**
   * Returns the URL of the IIIF Image API resource's info.json file
   */
  public transform(object: MediaObjectDescriptor): String {
    return ResolverService.iiifUrlToObject(object, true);
  }
}
