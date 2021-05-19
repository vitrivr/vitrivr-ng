import {Component, EventEmitter, Input, Output} from '@angular/core';
import {QueryContainerInterface} from '../../shared/model/queries/interfaces/query-container.interface';
import {TemporalMode} from './temporal-mode-container.model';

@Component({
  selector: 'app-temporal-mode-container',
  templateUrl: 'temporal-mode-container.component.html',
  styleUrls: ['./temporal-mode-container.component.css']
})

export class TemporalModeContainerComponent {

  mode: TemporalMode = 'TEMPORAL_DISTANCE';
  /** A reference to the lists of QueryContainers (to enable removing the container). */
  @Input() inList: QueryContainerInterface[];

  @Output() onModeChange = new EventEmitter<any>();

  constructor() {
  }

  public onModeChanged() {
    this.onModeChange.emit(this.mode);
  }

  public isTimeDistance(): boolean {
    return this.mode === 'TEMPORAL_DISTANCE';
  }
}
