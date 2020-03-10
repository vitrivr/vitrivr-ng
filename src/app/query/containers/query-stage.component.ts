import {Component, Input} from '@angular/core';
import {QueryStage} from '../../shared/model/queries/query-stage.model';
import {QueryTermInterface} from '../../shared/model/queries/interfaces/query-term.interface';
import {StageChangeEvent} from './stage-change-event.model';
import {ConfigService} from '../../core/basics/config.service';

@Component({
  selector: 'app-query-stage',
  templateUrl: 'query-stage.component.html',
  styleUrls: []
})

export class QueryStageComponent {

  @Input() queryStage: QueryStage;

  @Input() qsList: QueryStage[];

  constructor(private _configService: ConfigService) {

  }

  public index() {
    return this.qsList.indexOf(this.queryStage);
  }

  /**
   * Notification from child that a queryterm should be moved up or down a stage
   */
  onStageChange($event: StageChangeEvent, qt: QueryTermInterface) {
    console.log(qt);
    this.removeQueryTerm(qt);
    switch ($event) {
      case StageChangeEvent.EARLIER_STAGE:
        this.qsList[this.index() - 1].terms.push(qt);
        console.log(this.qsList[this.index() - 1]);
        break;
      case StageChangeEvent.LATER_STAGE:
        /* Insert new stage if there are no terms yet*/
        if (this.isLastStage()) {
          this.qsList.push(new QueryStage())
        }
        this.qsList[this.index() + 1].terms.push(qt);
        console.log(JSON.stringify(this.qsList[this.index() + 1]));
        break;
    }
    /* remove this querystage from the list if there are no terms left*/
    if (this.queryStage.terms.length === 0) {
      this.qsList.splice(this.index(), 1);
    }
  }

  removeQueryTerm(qt: QueryTermInterface) {
    this.queryStage.terms.splice(this.queryStage.terms.indexOf(qt), 1);
  }

  private isLastStage() {
    return this.qsList.indexOf(this.queryStage) == this.qsList.length - 1;
  }

  sqEnabled(): boolean {
    return this._configService.getValue().get<boolean>('query.staged')
  }
}
