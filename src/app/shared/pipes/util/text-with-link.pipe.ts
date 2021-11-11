import {Pipe, PipeTransform} from '@angular/core';
import {HtmlUtil} from '../../util/html.util';

@Pipe({
  name: 'TextWithLinkPipe'
})
export class TextWithLinkPipe implements PipeTransform {

  /**
   * Replaces all links in the provided text by links.
   *
   * @param {string} str String that should be replaced.
   * @return {string} Modified string.
   */
  public transform(str: string): string {
    return HtmlUtil.replaceUrlByLink(str, '_blank');
  }
}
