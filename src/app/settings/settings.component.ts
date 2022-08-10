import {AfterContentInit, ChangeDetectionStrategy, Component} from '@angular/core';
import {NotificationUtil} from '../shared/util/notification.util';
import {NotificationService} from '../core/basics/notification.service';
import {Config} from "../shared/model/config/config.model";
import {AppConfig} from "../app.config";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements AfterContentInit {

  dresBadgeValue: string = NotificationUtil.getNotificationSymbol()
  dresAddress = ((c: Config) => c._config.competition.host);
  config: Config;

  constructor(private _notificationService: NotificationService, private _configService: AppConfig,) {
  }

  ngAfterContentInit(): void {
    this._configService.configAsObservable.subscribe(c => {
      this.config = c
    })
    /* This can be improved using combineLatest() if there are ever multiple badge observables */
    this._notificationService.getDresStatusBadgeObservable().subscribe(el => {
      this.dresBadgeValue = el
    })
  }

}
