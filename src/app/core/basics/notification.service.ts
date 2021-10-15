import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, of} from 'rxjs';
import {VbsSubmissionService} from '../vbs/vbs-submission.service';
import {NotificationUtil} from '../../shared/util/notification.util';
import {catchError, tap} from 'rxjs/operators';
import {AppConfig} from '../../app.config';

@Injectable()
export class NotificationService {

  private _dresStatusBadge = new BehaviorSubject('')

  constructor(private _submissionService: VbsSubmissionService, private _configService: AppConfig) {
    combineLatest([this._submissionService.statusObservable, this._configService.configAsObservable]).pipe(
      tap(([status, config]) => {
          if (config._config.competition.host) {
            /* Do not update observable for undefined since that is the initial value*/
            if (status) {
              this._dresStatusBadge.next('')
            }
          }
        }
      ),
      catchError(err => {
        if (this._configService.config._config.competition.host) {
          this._dresStatusBadge.next(NotificationUtil.getNotificationSymbol())
        }
        return of()
      })).subscribe()
  }

  public getDresStatusBadgeObservable() {
    return this._dresStatusBadge.asObservable()
  }

  public setDresStatusBadge(status: string) {
    this._dresStatusBadge.next(status)
  }
}
