import {Pipe, PipeTransform} from '@angular/core';
import {VbsSubmissionService} from '../../../core/competition/vbs-submission.service';
import {map} from 'rxjs/operators';
import {AppConfig} from '../../../app.config';
import { Observable } from 'rxjs';

@Pipe({
  name: 'competitionEnabledPipe' // should be camelCase https://angular.io/guide/styleguide
})
export class CompetitionEnabledPipe implements PipeTransform {

  constructor(private _config: AppConfig) {
  }

  /**
   * Returns true if the competition host is set. False otherwise. Doesn't require an input
   * @param type The type to check. empty to generically check for competition
   *
   * @return {boolean}
   */
  public transform(type?: string): Observable<boolean> {
    if(type){
      if(type === 'vbs' || type === 'lsc'){
        return this._config.configAsObservable.pipe(map(c => c.get<boolean>('competition.'+type)));
      } else if(type.length === 0){
        return this._config.configAsObservable.pipe(map(c => c.get<boolean>('competition.host')));
      }else{
        throw Error(`Invalid competition type: ${type}`);
      }
    }
      return this._config.configAsObservable.pipe(map(c => c.get<boolean>('competition.host')));
  }
}
