import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {QueryTermInterface} from '../../shared/model/queries/interfaces/query-term.interface';
import {ConfigService} from '../../core/basics/config.service';
import {StageChangeEvent} from './stage-change-event.model';

@Component({
  selector: 'app-query-component',
  templateUrl: 'query-term.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class QueryTermComponent {

  @Input() queryTerm: QueryTermInterface;

  @Input() firstStage: boolean;
  @Input() lastStage: boolean;

  @Input() lastInStage: boolean;

  /**
   * 1 = move up in filter sequence (e.g. stage 1 goes to stage 0), -1 = move down in filter sequence (e.g. stage 1 goes to stage 2)
   */
  @Output() stageChange = new EventEmitter<StageChangeEvent>();

  constructor(private readonly _config: ConfigService) {
  }

  onPushUpClicked() {
    this.stageChange.emit(StageChangeEvent.EARLIER_STAGE);
  }

  onPushDownClicked() {
    this.stageChange.emit(StageChangeEvent.LATER_STAGE);
  }

  stagedQEnabled() {
    return this._config.getValue().get<Boolean>('query.staged');
  }
}
