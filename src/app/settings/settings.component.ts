import {AfterContentInit, ChangeDetectionStrategy, Component} from '@angular/core';
import {NotificationUtil} from '../shared/util/notification.util';
import {NotificationService} from '../core/basics/notification.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements AfterContentInit {
  /**
   * Currently selected tab by index. Also functions as a setter.
   */
  selectedTabIndex: number;

  dresBadgeValue: string = NotificationUtil.getNotificationSymbol()

  constructor(private _notificationService: NotificationService) {
  }

  ngAfterContentInit(): void {
    /* This can be improved using combineLatest() if there are ever multiple badge observables */
    this._notificationService.getDresStatusBadgeObservable().subscribe(el => {
      this.dresBadgeValue = el
    })
  }

}
