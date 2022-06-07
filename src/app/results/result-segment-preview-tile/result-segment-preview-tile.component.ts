import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MediaSegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {AbstractSegmentResultsViewComponent} from '../abstract-segment-results-view.component';
import {KeyboardService} from '../../core/basics/keyboard.service';
import {QueryService} from '../../core/queries/query.service';
import {EventBusService} from '../../core/basics/event-bus.service';
import {VbsSubmissionService} from '../../core/competition/vbs-submission.service';
import {ResolverService} from '../../core/basics/resolver.service';
import {ContextKey, InteractionEventComponent} from '../../shared/model/events/interaction-event-component.model';
import {InteractionEvent} from '../../shared/model/events/interaction-event.model';
import {InteractionEventType} from '../../shared/model/events/interaction-event-type.model';
import {MatDialog} from '@angular/material/dialog';
import {QuickViewerComponent} from '../../objectdetails/quick-viewer.component';
import {AppConfig} from '../../app.config';
import {TemporalObjectSegments} from '../../shared/model/misc/temporalObjectSegments';
import {Tag} from '../../core/selection/tag.model';
import {SelectionService} from '../../core/selection/selection.service';

/**
 * Dedicated component for the preview of a segment.
 *
 * Handles everything related to that.
 */
@Component({
  selector: 'app-result-segment-preview-tile',
  templateUrl: './result-segment-preview-tile.component.html',
  styleUrls: ['./result-segment-preview-tile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultSegmentPreviewTileComponent implements OnInit, OnDestroy {

  @Input() mltEnabled = true;

  /**
   * The segment this preview is for
   */
  @Input() segment: MediaSegmentScoreContainer;

  /**
   * The container this segment preview is in
   */
  @Input() container: AbstractSegmentResultsViewComponent<MediaSegmentScoreContainer[]>;

  /**
   * Optional: if this segment is part of a temporal object
   */
  @Input() temporalObject: TemporalObjectSegments;

  /**
   * The score of the segment. Will be used for the coloring of the background.
   *
   * We implemented the temporal scoring view, where the score is not the segment score - otherwise this is should be equivalent to segment.score
   */
  @Input() score: number;

  /**
   * A flag whether this preview is in focus or not.
   */
  _focus = false;

  _tags: Tag[] = []

  constructor(readonly _keyboardService: KeyboardService,
              private _queryService: QueryService,
              private _eventBusService: EventBusService,
              public _vbs: VbsSubmissionService,
              private _dialog: MatDialog,
              public _resolver: ResolverService,
              private _configService: AppConfig,
              private _selectionService: SelectionService,
              private _cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this._tags = this._selectionService.getTags(this.segment.segmentId)
    this._selectionService.register(this.segment.segmentId).subscribe(tags => {
      // the following line of code is there because the array we get is the same as previously and there is no deep check. Cloning the array forces a re-render.
      this._tags = [ ...tags]
      this._cdr.detectChanges()
    })
  }

  ngOnDestroy(): void {
    this._selectionService.deregister(this.segment.segmentId)
  }

  /**
   * Returns the segment's ID, which then again is used for the ID of the corresponding html element
   */
  public get id(): string {
    return this.segment.segmentId;
  }

  /**
   * Invokes when a user clicks the 'Find neighbouring segments' button.
   */
  public onNeighborsButtonClicked() {
    this._queryService.lookupNeighboringSegments(this.segment.segmentId, this._configService.config.get<number>('query.config.neighboringSegmentLookupCount'));
  }

  /**
   * Invokes when a user right clicks the 'Find neighbouring segments' button. Loads neighbouring segments with
   * a high count.
   */
  public onNeighborsButtonRightClicked(event: Event) {
    this._queryService.lookupNeighboringSegments(this.segment.segmentId, this._configService.config.get<number>('query.config.neighboringSegmentLookupAllCount'));
    event.preventDefault();
  }

  /**
   * Invoked when a user clicks one of the 'Tag' buttons. Toggles the tag for the selected segment.
   *
   * @param {MediaSegmentScoreContainer} segment The segment that was tagged.
   * @param {Tag} tag The tag that should be toggled.
   */
  public onHighlightButtonClicked(segment: MediaSegmentScoreContainer, tag: Tag) {
    this._selectionService.toggle(tag, segment.segmentId);
  }

  public submit(){
    this._vbs.submitSegment(this.segment);
    this._tags = this._selectionService.getTags(this.segment.segmentId)
  }

  /**
   * Invoked whenever a user clicks the actual tile; opens the QuickViewerComponent in a dialog.
   */
  public onTileClicked(event: MouseEvent) {
    if (event.shiftKey) {
      /* Shift-Click will trigger VBS submit. */
      this.submit()
    } else {
      /* Normal click will display item. */
      this._dialog.open(QuickViewerComponent, {data: this.segment});
      const context: Map<ContextKey, any> = new Map();
      context.set('i:mediasegment', this.segment.segmentId);
      this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXAMINE, context)))
    }
  }


}
