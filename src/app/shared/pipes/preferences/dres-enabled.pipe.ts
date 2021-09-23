import {Pipe, PipeTransform} from '@angular/core';
import {Config} from '../../model/config/config.model';

/**
 * Generally, async functions should pipe variables since angular can't cache function outputs
 *
 * See https://stackoverflow.com/questions/56583829/i-am-experiencing-bad-performance-in-my-angular-component-is-there-something-i
 */
@Pipe({
  name: 'DresEnabledPipe'
})
export class DresEnabledPipe implements PipeTransform {

  public transform<T>(c: Config): boolean {
    console.log('checking if dres is enabled')
    return !(c._config.competition.host === null || c._config.competition.host === '')
  }
}
