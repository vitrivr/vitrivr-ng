import {Pipe, PipeTransform} from '@angular/core';
import {Config} from '../../model/config/config.model';

/**
 * Fetches a specified value from the config
 */
@Pipe({
  name: 'GetConfigVariablePipe'
})
export class GetConfigVariablePipe implements PipeTransform {

  public transform<T>(c: Config, fun: ((value: Config) => any)): any {
    if (!c) {
      return null
    }
    return fun(c)
  }
}
