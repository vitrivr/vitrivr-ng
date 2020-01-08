import {Observable} from 'rxjs';
import {SegmentScoreContainer} from '../shared/model/results/scores/segment-score-container.model';
import {ContextKey, InteractionEventComponent} from '../shared/model/events/interaction-event-component.model';
import {InteractionEvent} from '../shared/model/events/interaction-event.model';
import {InteractionEventType} from '../shared/model/events/interaction-event-type.model';
import {QuickViewerComponent} from '../objectdetails/quick-viewer.component';
import {ResultsContainer} from '../shared/model/results/scores/results-container.model';
import {AbstractResultsViewComponent} from './abstract-results-view.component';
import {ChangeDetectorRef, HostListener} from '@angular/core';
import {QueryService} from '../core/queries/query.service';
import {FilterService} from '../core/queries/filter.service';
import {SelectionService} from '../core/selection/selection.service';
import {EventBusService} from '../core/basics/event-bus.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConfigService} from '../core/basics/config.service';
import {ResolverService} from '../core/basics/resolver.service';
import {MatDialog} from '@angular/material/dialog';
import {VbsSubmissionService} from '../core/vbs/vbs-submission.service';
import {VgAPI} from 'videogular2/core';
import {first} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

/**
 * More specialized AbstractResultsView, tailored for views which display segments
 */
export abstract class AbstractSegmentResultsViewComponent<T> extends AbstractResultsViewComponent<T> {

  /** Reference to the SegmentScoreContainer that is currently in focus. */
  protected _focus: SegmentScoreContainer;

  public ctrlPressed = new BehaviorSubject(false);


  constructor(_cdr: ChangeDetectorRef,
              _queryService: QueryService,
              _filterService: FilterService,
              _selectionService: SelectionService,
              _eventBusService: EventBusService,
              _router: Router,
              _snackBar: MatSnackBar,
              protected _configService: ConfigService,
              public _resolver: ResolverService,
              protected _dialog: MatDialog,
              protected _vbs: VbsSubmissionService) {
    super(_cdr, _queryService, _filterService, _selectionService, _eventBusService, _router, _snackBar);
  }

  /**
   * Sets the focus to the provided SegmentScoreContainer.
   *
   * @param focus
   */
  set focus(focus: SegmentScoreContainer) {
    this._focus = focus;
  }

  /**
   * Getter for the filters that should be applied to SegmentScoreContainer.
   */
  get filters(): Observable<((v: SegmentScoreContainer) => boolean)[]> {
    return this._filterService.segmentFilter;
  }

  /**
   * Returns true, if the provided SegmentScoreContainer is currently in focus and false otherwise.
   *
   * @param segment SegmentScoreContainer that should be checked.
   * @return {boolean}
   */
  public inFocus(segment: SegmentScoreContainer) {
    return this._focus === segment;
  }

  /**
   * Invokes when a user clicks the 'Find neighbouring segments' button.
   *
   * @param {SegmentScoreContainer} segment
   */
  public onNeighborsButtonClicked(segment: SegmentScoreContainer) {
    this._queryService.lookupNeighboringSegments(segment.segmentId, this._configService.getValue().get<number>('query.config.neighboringSegmentLookupCount'));
    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediasegment', segment.segmentId);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXPAND, context)));
  }

  /**
   * Invokes when a user right clicks the 'Find neighbouring segments' button. Loads neighbouring segments with
   * a count of 500.
   *
   * @param {Event} event
   * @param {SegmentScoreContainer} segment
   */
  public onNeighborsButtonRightClicked(event: Event, segment: SegmentScoreContainer) {
    this._queryService.lookupNeighboringSegments(segment.segmentId, this._configService.getValue().get<number>('query.config.neighboringSegmentLookupAllCount'));
    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediasegment', segment.segmentId);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXPAND, context)));
    event.preventDefault();
  }

  /**
   * Invoked when a user clicks the selection/favourie button. Toggles the selection mode of the SegmentScoreContainer.
   *
   * @param {SegmentScoreContainer} segment
   */
  public onSubmitButtonClicked(segment: SegmentScoreContainer) {
    this._vbs.submitSegment(segment);
  }

  /**
   * Invoked whenever a user clicks the actual tile; opens the QuickViewerComponent in a dialog.
   *
   * @param {MouseEvent} event
   * @param {SegmentScoreContainer} segment
   */
  public onTileClicked(event: MouseEvent, segment: SegmentScoreContainer) {
    if (event.shiftKey) {
      /* Shift-Click will trigger VBS submit. */
      this._vbs.submitSegment(segment);
    } else {
      /* Normal click will display item. */
      this._dialog.open(QuickViewerComponent, {data: segment});
      const context: Map<ContextKey, any> = new Map();
      context.set('i:mediasegment', segment.segmentId);
      this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXAMINE, context)))
    }
  }

  /**
   * Returns true, if the submit (to VBS) button should be displayed for the given segment and false otherwise. This depends on the configuration and
   * the media type of the object.
   *
   * @param {SegmentScoreContainer} segment The segment for which to determine whether the button should be displayed.
   * @return {boolean} True if submit button should be displayed, false otherwise.
   */
  public showVbsSubmitButton(segment: SegmentScoreContainer): Observable<boolean> {
    return this._vbs.isOn;
  }

  /**
   * Subscribes to the data exposed by the ResultsContainer.
   *
   * @return {Observable<MediaObjectScoreContainer>}
   */
  protected abstract subscribe(results: ResultsContainer): void;


  public onPlayerReady(api: VgAPI, segment: SegmentScoreContainer) {
    api.getDefaultMedia().subscriptions.loadedData.pipe(first()).subscribe(() => this.seekToFocusPosition(api, segment));
  }

  /**
   * Seeks to the position of the focus segment. If that position is undefined, this method has no effect.
   */
  public seekToFocusPosition(api: VgAPI, segment: SegmentScoreContainer) {
    if (segment) {
      api.seekTime(segment.startabs);
    }
  }

  playVideo(segment: SegmentScoreContainer): Observable<boolean> {
    return this.ctrlPressed.map(el => el && segment.objectScoreContainer.mediatype === 'VIDEO' && this._focus === segment);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown($event: KeyboardEvent) {
    if ($event.ctrlKey) {
      this.ctrlPressed.next(true);
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp($event: KeyboardEvent) {
    if ($event.key === 'Control') {
      this.ctrlPressed.next(false);
    }
  }
}
