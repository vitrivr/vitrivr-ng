import {Component, ViewChild} from '@angular/core';
import {MatTab, MatTabChangeEvent} from '@angular/material/tabs';
import {InformationComponent} from './information/information.component';
import {EventBusService} from '../core/basics/event-bus.service';
import {InteractionEvent} from '../shared/model/events/interaction-event.model';
import {InteractionEventComponent} from '../shared/model/events/interaction-event-component.model';
import {InteractionEventType} from '../shared/model/events/interaction-event-type.model';

@Component({

  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  @ViewChild('informationComponent')
  private informationComponent: InformationComponent;

  @ViewChild('informationTab')
  private informationTab: MatTab;

  /**
   * Currently selected tab by index. Also functions as a setter.
   */
  _selectedIndex: number;

  constructor(private _eventBusService: EventBusService) {
  }


  tabChange($event: MatTabChangeEvent) {
    if ($event.tab === this.informationTab) {
      this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.RESULT_SET_INFORMATION)))
    }
  }

  /**
   * @param $event true if now visible, false if now hidden
   */
  toggled($event: boolean) {
    if (this._selectedIndex === 3 && $event) {
      this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.RESULT_SET_INFORMATION)))
    }
  }
}
