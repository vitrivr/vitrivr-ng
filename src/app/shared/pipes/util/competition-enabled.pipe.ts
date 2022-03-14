import {Pipe, PipeTransform} from '@angular/core';
import {VbsSubmissionService} from '../../../core/vbs/vbs-submission.service';
import {map} from 'rxjs/operators';
import {AppConfig} from '../../../app.config';
import { Observable } from 'rxjs';

@Pipe({
  name: 'CompetitionEnabledPipe'
})
export class CompetitionEnabledPipe implements PipeTransform {

  constructor(private _config: AppConfig) {
  }

  /**
   * Returns true uf VBS mode is active and properly configured (i.e. endpoint and team ID is specified).
   *
   * @return {boolean}
   */
  public transform(submissionService: VbsSubmissionService): Observable<boolean> {
    return this._config.configAsObservable.pipe(map(c => c.get<boolean>('competition.host')));
  }
}
