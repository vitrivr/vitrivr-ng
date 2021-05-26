import {Component, EventEmitter, Input, Output} from '@angular/core';
import {QueryContainerInterface} from '../../shared/model/queries/interfaces/query-container.interface';
import {TemporalMode} from './temporal-mode-container.model';

@Component({
  selector: 'app-temporal-mode-container',
  templateUrl: 'temporal-mode-container.component.html',
  styleUrls: ['./temporal-mode-container.component.css']
})

export class TemporalModeContainerComponent {

  maxLength = 600;

  mode: TemporalMode = 'TEMPORAL_DISTANCE';
  /** A reference to the lists of QueryContainers (to enable updating the mode). */
  @Input() inList: QueryContainerInterface[];

  /** Output emitter to update the current temporal mode */
  @Output() onModeChange = new EventEmitter<any>();

  constructor() {
  }

  /** On a mode change, update the mode by emitting the current mode */
  public onModeChanged() {
    this.onModeChange.emit(this.mode);
  }

  public isTimeDistance(): boolean {
    return this.mode === 'TEMPORAL_DISTANCE';
  }

  public getTemporalMaxLengthFromUser(): number {
    return this.maxLength;
  }
}
