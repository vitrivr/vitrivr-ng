import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {VbsSubmissionService} from '../vbs/vbs-submission.service';
import {NotificationUtil} from '../../shared/util/notification.util';
import {ConfigService} from './config.service';
import {tap} from 'rxjs/operators';

@Injectable()
export class NotificationService {

  private _dresStatusBadge = new BehaviorSubject('')

  constructor(
    private _submissionService: VbsSubmissionService,
    private _configService: ConfigService
  ) {
    combineLatest([this._submissionService.statusObservable(), this._configService.asObservable()]).pipe(tap(([status, config]) => {
      if (config._config.competition.dres) {
        if (status) {
          /* Only give ok if we receive a username from dres*/
          if (status.username) {
            this._dresStatusBadge.next('')
            return
          }
          this._dresStatusBadge.next(NotificationUtil.getNotificationSymbol())
        }
        /* Do not update observable for undefined since that is the initial value*/
      }
    })).subscribe()
  }

  public getDresStatusBadgeObservable() {
    return this._dresStatusBadge.asObservable()
  }

  public setDresStatusBadge(status: string) {
    this._dresStatusBadge.next(status)
  }
}
