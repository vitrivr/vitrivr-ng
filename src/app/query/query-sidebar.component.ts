import {Component, HostListener, OnInit, QueryList, ViewChildren, AfterViewInit} from '@angular/core';
import {QueryService} from '../core/queries/query.service';
import {QueryContainerInterface} from '../shared/model/queries/interfaces/query-container.interface';
import {StagedQueryContainer} from '../shared/model/queries/staged-query-container.model';
import {EventBusService} from '../core/basics/event-bus.service';
import {InteractionEventComponent} from '../shared/model/events/interaction-event-component.model';
import {InteractionEventType} from '../shared/model/events/interaction-event-type.model';
import {InteractionEvent} from '../shared/model/events/interaction-event.model';
import {FilterService} from '../core/queries/filter.service';
import {QueryContainerComponent} from './containers/query-container.component';
import {TemporalMode} from '../settings/preferences/temporal-mode-container.model';
import {Observable} from 'rxjs';
import {Config} from '../shared/model/config/config.model';
import {AppConfig} from '../app.config';


@Component({
  selector: 'app-query-sidebar',
  templateUrl: 'query-sidebar.component.html'
})
export class QuerySidebarComponent implements OnInit, AfterViewInit {

  private _config: Observable<Config>;

  /** StagedQueryContainer's held by the current instance of ResearchComponent. */
  public readonly containers: QueryContainerInterface[] = [];

  @ViewChildren(QueryContainerComponent) queryContainers: QueryList<QueryContainerComponent>;
  /** A timestamp used to store the timestamp of the last Enter-hit by the user. Required for shortcut detection. */
  private _lastEnter = 0;
  public mode: TemporalMode = 'TEMPORAL_DISTANCE';
  public maxLength = 600;

  constructor(private _queryService: QueryService, private _filterService: FilterService, private _eventBus: EventBusService, private _configService: AppConfig) {
    this._config = this._configService.configAsObservable;
    this._config.subscribe(c => {
      this.maxLength = c.maxLength;
      this.mode = c._config.query.temporal_mode as TemporalMode;
    });
  }

  /**
   * Lifecycle Callback (OnInit): Adds a new QueryTermContainer.
   */
  public ngOnInit() {
    this.addQueryTermContainer();
  }

  /**
   * Subscribe the query containers to the mode change possible by the temporal mode component
   */
  ngAfterViewInit() {
    this._config.subscribe(c => {
      this.modeChange(c._config.query.temporal_mode as TemporalMode)
    });
    this.queryContainers.changes.subscribe(_ =>
      this.modeChange(this.mode) // subsequent calls to modeChange will trigger an update to the mode of the component
    );
  }

  /**
   * Adds a new StagedQueryContainer to the list of QueryContainers.
   */
  public addQueryTermContainer() {
    this.containers.push(new StagedQueryContainer());
  }

  /**
   * Triggers the temporal onSearchClicked by packing all configured QueryContainers into a single
   * TemporalQuery message, and submitting that message to the QueryService.
   *
   * context changes are only part of competition logging and not part of the message sent to cineast
   */
  public onSearchClicked() {
    let tempDist = []
    if (this.queryContainers && this.queryContainers.length >= 2 && this.mode === 'TEMPORAL_DISTANCE') {
      tempDist = this.getTemporalDistances();
    }

    this._queryService.findTemporal(this.containers, tempDist, this.maxLength);
  }

  /**
   * Clears all results and resets query terms.
   */
  public onClearAllClicked() {
    this._queryService.clear();
    this._filterService.clear();
    this.containers.length = 0;
    this.addQueryTermContainer();
    this._eventBus.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.CLEAR)));
  }

  /**
   * Detects certain key combinations and takes appropriate action.
   *
   * @param {KeyboardEvent} event
   */
  @HostListener('window:keyup', ['$event'])
  public keyEvent(event: KeyboardEvent) {
    /** Detects a double-enter, which will trigger a new search. */
    if (event.keyCode === 13) {
      const timestamp = Date.now();
      if (timestamp - this._lastEnter < 1000) {
        this.onSearchClicked();
        this._lastEnter = 0;
      } else {
        this._lastEnter = timestamp;
      }
    }

    /** F1 will trigger a search. */
    if (event.keyCode == 112) {
      this.onSearchClicked();
    }

    /** F2 will reset the search. */
    if (event.keyCode == 113) {
      this.onClearAllClicked();
    }
  }

  /* Traverse all elements and retrieve the time distances */
  private getTemporalDistances(): number[] {
    if (this.containers.length > 1 && this.mode) {
      const timeDistances = [this.containers.length - 1];
      let i = 0;
      this.queryContainers.forEach((container) => {
        if (i > 0) {
          timeDistances[i - 1] = container.temporalDistances.first.getTemporalDistanceFromUser();
        }
        i += 1;
      });
      return timeDistances
    } else {
      return [];
    }
  }

  /**
   * Change the mode and update all query containers with the new mode
   * @param mode New temporal mode
   */
  public modeChange(mode: TemporalMode) {
    this.mode = mode;
    this.queryContainers.forEach((container) => {
      container.changeMode(mode);
    })
  }
}
