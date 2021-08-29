import {AfterContentInit, Component, ViewChild} from '@angular/core';
import {MatTab, MatTabChangeEvent} from '@angular/material/tabs';
import {EventBusService} from '../core/basics/event-bus.service';
import {InformationComponent} from './information/information.component';
import {InteractionEvent} from '../shared/model/events/interaction-event.model';
import {InteractionEventComponent} from '../shared/model/events/interaction-event-component.model';
import {InteractionEventType} from '../shared/model/events/interaction-event-type.model';
import {NotificationUtil} from '../shared/util/notification.util';
import {NotificationService} from '../core/basics/notification.service';

@Component({

  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements AfterContentInit {
  @ViewChild('informationComponent')
  private informationComponent: InformationComponent;

  @ViewChild('informationTab')
  private informationTab: MatTab;

  /**
   * Currently selected tab by index. Also functions as a setter.
   */
  _selectedIndex: number;

  _badgeValue: string = NotificationUtil.getNotificationSymbol()

  constructor(private _eventBusService: EventBusService, private _notificationService: NotificationService) {

  }


  tabChange($event: MatTabChangeEvent) {
    if ($event.tab === this.informationTab) {
      this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.RESULT_SET_STATISTICS)))
    }
  }

  /**
   * @param $event true if now visible, false if now hidden
   */
  toggled($event: boolean) {
    if (this._selectedIndex === 3 && $event) {
      this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.RESULT_SET_STATISTICS)))
    }
  }

  ngAfterContentInit(): void {
    /* This can be improved using combineLatest() if there are ever multiple badge observables */
    this._notificationService.getDresStatusBadgeObservable().subscribe(el => this._badgeValue = el)
  }
}
