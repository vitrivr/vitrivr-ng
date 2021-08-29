import { ChangeDetectorRef, OnDestroy, OnInit, Directive } from '@angular/core';
import {ResultsContainer} from '../shared/model/results/scores/results-container.model';
import {QueryChange, QueryService} from '../core/queries/query.service';
import {MediaSegmentScoreContainer} from '../shared/model/results/scores/segment-score-container.model';
import {EMPTY, Observable} from 'rxjs';
import {SelectionService} from '../core/selection/selection.service';
import {Tag} from '../core/selection/tag.model';
import {ColorUtil} from '../shared/util/color.util';
import {EventBusService} from '../core/basics/event-bus.service';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {InteractionEvent} from '../shared/model/events/interaction-event.model';
import {InteractionEventType} from '../shared/model/events/interaction-event-type.model';
import {FeatureDetailsComponent} from './feature-details.component';
import {ContextKey, InteractionEventComponent} from '../shared/model/events/interaction-event-component.model';
import {MediaObjectScoreContainer} from '../shared/model/results/scores/media-object-score-container.model';
import {MediaObjectDragContainer} from '../shared/model/internal/media-object-drag-container.model';
import {MediaSegmentDragContainer} from '../shared/model/internal/media-segment-drag-container.model';
import {Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {FilterService} from '../core/queries/filter.service';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class AbstractResultsViewComponent<T> implements OnInit, OnDestroy {
  /** Local reference to the subscription to the QueryService. */
  protected _queryServiceSubscription;
  /** Local reference to the subscription to the FilterService. */
  protected _filterServiceSubscription;
  /** Local reference to the subscription of the SelectionService. */
  protected _selectionServiceSubscription;
  /** Name of this AbstractResultsViewComponent. */
  protected abstract name;

  /** Indicator whether the progress bar should be visible. */
  private _loading = false;

  /** Indicator whether or not we should scroll*/
  private _updateScroll = false;

  /** Local reference to the data source holding the query results.*/
  protected _dataSource: Observable<T> = EMPTY;

  /**
   * Default constructor.
   *
   * @param _cdr Reference to ChangeDetectorRef used to inform component about changes.
   * @param _filterService
   * @param _queryService Reference to the singleton QueryService used to interact with the QueryBackend
   * @param _selectionService Reference to the singleton SelectionService used for item highlighting.
   * @param _eventBusService Reference to the singleton EventBusService, used to listen to and emit application events.
   * @param _router The Router used for navigation
   * @param _snackBar The MatSnackBar component used to display the SnackBar.
   */
  protected constructor(protected _cdr: ChangeDetectorRef,
              protected _queryService: QueryService,
              protected _filterService: FilterService,
              protected _selectionService: SelectionService,
              protected _eventBusService: EventBusService,
              protected _router: Router,
              protected _snackBar: MatSnackBar) {
  }

  get loading(): boolean {
    return this._loading;
  }

  get dataSource(): Observable<T> {
    return this._dataSource;
  }

  /** The number of items that should be displayed. */
  protected _count: number = this.scrollIncrement();

  /**
   * Getter for count property (for limiting the result set)
   */
  get count(): number {
    return this._count;
  }

  get selectionService(): SelectionService {
    return this._selectionService;
  }

  /**
   * Calculates and returns a green colour with a varying intensity based on the provided score.
   *
   * @param {number} segment The segment for which the background should be evaluated.
   * @return String that encodes the RGB value.
   */
  public backgroundForSegment(segment: MediaSegmentScoreContainer): string {
    const score = segment.score;
    return this.backgroundForScore(score, segment);
  }

  public backgroundForScore(score: number, segment: MediaSegmentScoreContainer): string {
    const tags: Tag[] = this._selectionService.getTags(segment.segmentId);
    if (tags.length === 0) {
      const v = Math.round(255.0 - (score * 255.0));
      return ColorUtil.rgbToHex(v, 255, v);
    } else if (tags.length === 1) {
      return tags[0].colorForRelevance(score);
    } else {
      const width = 100.0 / tags.length;
      return 'repeating-linear-gradient(90deg,' +
        tags.map((t, i) =>
          t.colorForRelevance(score) + ' ' + i * width + '%,' + t.colorForRelevance(score) + ' ' + (i + 1) * width + '%'
        ).join(',') + ')';
    }
  }

  /**
   * Lifecycle Hook (onInit): Subscribes to the QueryService and the SelectionService
   */
  public ngOnInit(): void {
    this._queryServiceSubscription = this._queryService.observable.pipe(
      filter(msg => ['STARTED', 'ENDED', 'ERROR', 'CLEAR'].indexOf(msg) > -1)
    ).subscribe((msg) => this.onQueryStateChange(msg));
    this._selectionServiceSubscription = this._selectionService.subscribe(s => this._cdr.markForCheck());
    this._filterServiceSubscription = this._filterService.objectFilters.subscribe(s => {
      this._cdr.markForCheck()
    });
    this.subscribe(this._queryService.results);

    /* Publish navigation event. */
    const context = new Map<ContextKey, string>();
    context.set('n:component', this.name);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.NAVIGATE, context)))
  }

  /**
   * Lifecycle Hook (onDestroy): Unsubscribes from the QueryService and ResultsContainer subscription.
   */
  public ngOnDestroy() {
    this._queryServiceSubscription.unsubscribe();
    this._selectionServiceSubscription.unsubscribe();
    this._filterServiceSubscription.unsubscribe();
  }

  /**
   * The number of items to 'lazily load/unload' when scrolling.
   */
  abstract scrollIncrement(): number;

  /**
   * Triggered whenever a user clicks on the object details button. Triggers a transition to the ObjectdetailsComponent.
   *
   * @param segment SegmentScoreContainer for which details should be displayed.
   */
  public onDetailsButtonClicked(segment: MediaSegmentScoreContainer) {
    this._router.navigate(['/mediaobject/' + segment.objectId], {skipLocationChange: true});

    /* Emit an EXAMINE event on the bus. */
    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediasegment', segment.objectId);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXAMINE, context)))
  }

  /**
   * Triggered whenever a user clicks on the MLT (= MoreLikeThis) button. Triggers a MLT query with the QueryService.
   *
   * @param segment SegmentScoreContainer which should be used for MLT.
   */
  public onMltButtonClicked(segment: MediaSegmentScoreContainer) {
    this._queryService.findMoreLikeThis(segment, segment.objectScoreContainer.mediatype);
  }

  /**
   * Invoked whenever a user clicks the Information button. Displays a SnackBar with the scores per feature category.
   *
   * @param {MediaSegmentScoreContainer} segment SegmentScoreContainer for which to display information.
   */
  public onInformationButtonClicked(segment: MediaSegmentScoreContainer) {
    this._snackBar.openFromComponent(FeatureDetailsComponent, <MatSnackBarConfig>{data: segment, duration: 2500});

    /* Emit an EXAMINE event on the bus. */
    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediasegment', segment.segmentId);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXAMINE, context)))
  }

  /**
   * Invoked when a user clicks one of the 'Tag' buttons. Toggles the tag for the selected segment.
   *
   * @param {MediaSegmentScoreContainer} segment The segment that was tagged.
   * @param {Tag} tag The tag that should be toggled.
   */
  public onHighlightButtonClicked(segment: MediaSegmentScoreContainer, tag: Tag) {
    this._selectionService.toggle(tag, segment.segmentId);

    /* Emit a HIGHLIGHT event on the bus. */
    const context: Map<ContextKey, any> = new Map();
    context.set('i:mediasegment', segment.segmentId);
    this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.HIGHLIGHT, context)))
  }

  /**
   * Invoked when a user right clicks one of the 'Tag' buttons. Toggles all tags for the selected objects.
   *
   * @param {Event} event
   * @param {MediaSegmentScoreContainer} segment The object that was tagged.
   * @param {Tag} tag The tag that should be toggled.
   */
  public onHighlightButtonRightClicked(event: Event, segment: MediaSegmentScoreContainer, tag: Tag) {
    const segments = segment.objectScoreContainer.segments.map(v => v.segmentId);
    if (segments.length > 0) {
      console.warn(`the following line of code will toggle multiple segments but the usage of an identifier is unclear.`);
      this._selectionService.toggle(tag, ...segments);

      /* Emit a HIGHLIGHT event on the bus. */
      const context: Map<ContextKey, any> = new Map();
      context.set('i:mediasegment', segments.join(','));
      this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.HIGHLIGHT, context)));
    }
    event.preventDefault();
  }


  /**
   * Whenever a tile is dragged the associated segment and the media object that tile represents is converted to JSON and added to the dataTransfer object of the drag event.
   *
   * @param event Drag event
   * @param segment SegmentScoreContainer that is being dragged.
   * @param object MediaObjectScoreContainer that is being dragged.
   */
  public onTileDrag(event, segment?: MediaSegmentScoreContainer, object?: MediaObjectScoreContainer) {
    if (segment) {
      event.dataTransfer.setData(MediaSegmentDragContainer.FORMAT, MediaSegmentDragContainer.fromScoreContainer(segment).toJSON());
    }
    if (object) {
      event.dataTransfer.setData(MediaObjectDragContainer.FORMAT, MediaObjectDragContainer.fromScoreContainer(object).toJSON());
    }
  }

  /**
   * Increments the start value by the count value. Should be called by some kind of pagination control.
   */
  public incrementCount() {
    /* Increments the count and marks view for redraw by Angular. */
    this._count += this.scrollIncrement();
    this._cdr.markForCheck();

    /* Limits the frequency at which scroll events are logged. */
    if (this._updateScroll === false) {
      this._updateScroll = true;
      setTimeout(() => {
        this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.SCROLL)));
        this._updateScroll = false;
      }, 250)
    }
  }

  /**
   * Decrements the start value by the count value. Should be called by some kind of pagination control.
   */
  public decrementCount() {
    /* Increments the count and marks view for redraw by Angular. */
    this._count = Math.max(this._count - this.scrollIncrement(), this.scrollIncrement());
    this._cdr.markForCheck();

    /* Limits the frequency at which scroll events are logged. */
    if (this._updateScroll === false) {
      this._updateScroll = true;
      setTimeout(() => {
        this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.SCROLL)));
        this._updateScroll = false;
      }, 250)
    }
  }

  /**
   * Invoked whenever the QueryService reports that the results were updated. Causes
   * the gallery to be re-rendered.
   *
   * @param msg QueryChange message
   */
  protected onQueryStateChange(msg: QueryChange) {
    switch (msg) {
      case 'STARTED':
        this._loading = true;
        this.subscribe(this._queryService.results);
        break;
      case 'ENDED':
      case 'ERROR':
        this._loading = false;
        break;
      case 'CLEAR':
        this._dataSource = EMPTY;
        break;
    }
    this._cdr.markForCheck();
  }

  /**
   *
   * @param {ResultsContainer} results
   */
  protected abstract subscribe(results: ResultsContainer);
}
