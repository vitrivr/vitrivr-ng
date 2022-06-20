import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, of} from 'rxjs';
import {VbsSubmissionService} from '../competition/vbs-submission.service';
import {NotificationUtil} from '../../shared/util/notification.util';
import {catchError, tap} from 'rxjs/operators';
import {AppConfig} from '../../app.config';
import {DresService} from './dres.service';

@Injectable()
export class NotificationService {

  private _dresStatusBadge = new BehaviorSubject('')

  constructor(private _submissionService: VbsSubmissionService, private _configService: AppConfig, private _dresService: DresService) {
    combineLatest([this._dresService.statusObservable(), this._configService.configAsObservable]).pipe(
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
}
