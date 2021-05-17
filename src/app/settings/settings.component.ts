import {AfterContentInit, Component} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {EventBusService} from '../core/basics/event-bus.service';
import {NotificationUtil} from '../shared/util/notification.util';
import {NotificationService} from '../core/basics/notification.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements AfterContentInit {
  /**
   * Currently selected tab by index. Also functions as a setter.
   */
  _selectedIndex: number;

  _badgeValue: string = NotificationUtil.getNotificationSymbol()

  constructor(private _eventBusService: EventBusService, private _notificationService: NotificationService) {

  }


  tabChange($event: MatTabChangeEvent) {
  }

  /**
   * @param $event true if now visible, false if now hidden
   */
  toggled($event: boolean) {
  }

  ngAfterContentInit(): void {
    /* This can be improved using combineLatest() if there are ever multiple badge observables */
    this._notificationService.getDresStatusBadgeObservable().subscribe(el => this._badgeValue = el)
  }
}
