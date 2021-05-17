import {Component, HostListener, OnInit, QueryList, ViewChildren} from '@angular/core';
import {QueryService} from '../core/queries/query.service';
import {QueryContainerInterface} from '../shared/model/queries/interfaces/query-container.interface';
import {StagedQueryContainer} from '../shared/model/queries/staged-query-container.model';
import {EventBusService} from '../core/basics/event-bus.service';
import {InteractionEventComponent} from '../shared/model/events/interaction-event-component.model';
import {InteractionEventType} from '../shared/model/events/interaction-event-type.model';
import {InteractionEvent} from '../shared/model/events/interaction-event.model';
import {FilterService} from '../core/queries/filter.service';
import {QueryContainerComponent} from './containers/query-container.component';
import {TemporalFusionFunction} from '../shared/model/results/fusion/temporal-fusion-function.model';


@Component({
  selector: 'app-query-sidebar',
  templateUrl: 'query-sidebar.component.html'
})
export class QuerySidebarComponent implements OnInit {
  /** StagedQueryContainer's held by the current instance of ResearchComponent. */
  public readonly containers: QueryContainerInterface[] = [];
  @ViewChildren(QueryContainerComponent) queryContainers: QueryList<QueryContainerComponent>;
  /** A timestamp used to store the timestamp of the last Enter-hit by the user. Required for shortcut detection. */
  private _lastEnter = 0;

  constructor(private _queryService: QueryService, private _filterService: FilterService, private _eventBus: EventBusService) {
  }

  /**
   * Lifecycle Callback (OnInit): Adds a new QueryTermContainer.
   */
  public ngOnInit() {
    this.addQueryTermContainer();
  }

  /**
   * Adds a new StagedQueryContainer to the list of QueryContainers.
   */
  public addQueryTermContainer() {
    this.containers.push(new StagedQueryContainer());
  }

  /**
   * Triggers the similarity onSearchClicked by packing all configured QueryContainers into a single
   * SimilarityQuery message, and submitting that message to the QueryService.
   *
   * context changes are only part of competition logging and not part of the message sent to cineast
   */
  public onSearchClicked() {
    if (this.queryContainers && this.queryContainers.length >= 2) {
      const tempDist = this.getTemporalDistance();
      if (tempDist) {
        TemporalFusionFunction.instance().setTemporalDistance(tempDist);
      }
    }

    this._queryService.findSimilar(this.containers);
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

  /**
   * To traverse the dom tree with @viewchildren, all the children need the annotation (i.e. decorator)
   */
  private getTemporalDistance() {
    if (this.queryContainers && this.queryContainers.length >= 2) {
      const second = this.queryContainers.toArray()[1] as QueryContainerComponent;
      if (second.temporalDistances && second.temporalDistances.length >= 1) {
        const temporalDistanceComponent = second.temporalDistances.first;
        if (temporalDistanceComponent) {
          return temporalDistanceComponent.getTemporalDistanceFromUser();
        }
      }
    }
    return null;
  }
}
