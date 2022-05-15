import {Pipe, PipeTransform} from '@angular/core';
import {VbsSubmissionService} from '../../../core/vbs/vbs-submission.service';
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
   *
   * @return {boolean}
   */
  public transform(_: any): Observable<boolean> {
    return this._config.configAsObservable.pipe(map(c => c.get<boolean>('competition.host')));
  }
}
