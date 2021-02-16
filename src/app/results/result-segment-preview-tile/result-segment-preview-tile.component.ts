import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {MediaSegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {AbstractSegmentResultsViewComponent} from '../abstract-segment-results-view.component';
import {first} from 'rxjs/operators';
import {KeyboardService} from '../../core/basics/keyboard.service';
import {QueryService} from '../../core/queries/query.service';
import {EventBusService} from '../../core/basics/event-bus.service';
import {VbsSubmissionService} from '../../core/vbs/vbs-submission.service';
import {ResolverService} from '../../core/basics/resolver.service';
import {ContextKey, InteractionEventComponent} from '../../shared/model/events/interaction-event-component.model';
import {InteractionEvent} from '../../shared/model/events/interaction-event.model';
import {InteractionEventType} from '../../shared/model/events/interaction-event-type.model';
import {MatDialog} from '@angular/material/dialog';
import {QuickViewerComponent} from '../../objectdetails/quick-viewer.component';
import {Observable} from 'rxjs';
import {VgApiService} from '@videogular/ngx-videogular/core';
import {AppConfig} from '../../app.config';

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
export class ResultSegmentPreviewTileComponent implements OnInit {

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
   * The score of the segment. Will be used for the coloring of the background.
   *
   * We implemented the temporal scoring view, where the score is not the segment score - otherwise this is should be equivalent to segment.score
   */
  @Input() score: number;

  /**
   * A flag whether this preview is in focus or not.
   */
  private _focus = false;

  constructor(readonly _keyboardService: KeyboardService,
              private _queryService: QueryService,
              private _eventBusService: EventBusService,
              private _vbs: VbsSubmissionService,
              private _dialog: MatDialog,
              private _resolver: ResolverService,
              private _configService: AppConfig) {
  }

  /**
   * Sets the flag, that this preview is in focus
   * @param inFocus
   */
  set focus(inFocus: boolean) {
    this._focus = inFocus;
  }

  /**
   * Returns the segment's ID, which then again is used for the ID of the corresponding html element
   */
  public get id(): string {
    return this.segment.segmentId;
  }

  /**
   * Returns whether this segment's preview is in focus or not.
   */
  get inFocus(): boolean {
    return this._focus;
  }

  /**
   * Invokes when a user clicks the 'Find neighbouring segments' button.
   */
  public onNeighborsButtonClicked() {
    this._queryService.lookupNeighboringSegments(this.segment.segmentId, this._configService.config.get<number>('query.config.neighboringSegmentLookupCount'));
  }

  /**
   * Invokes when a user right clicks the 'Find neighbouring segments' button. Loads neighbouring segments with
   * a count of 500.
   */
  public onNeighborsButtonRightClicked(event: Event) {
    this._queryService.lookupNeighboringSegments(this.segment.segmentId, this._configService.config.get<number>('query.config.neighboringSegmentLookupAllCount'));
    event.preventDefault();
  }

  /**
   * Invoked when a user clicks the selection/favourie button. Toggles the selection mode of the SegmentScoreContainer.
   */
  public onSubmitButtonClicked() {
    this._vbs.submitSegment(this.segment);
  }


  /**
   * Returns true, if the submit (to VBS) button should be displayed for the given segment and false otherwise. This depends on the configuration and
   * the media type of the object.
   *
   * @return {boolean} True if submit button should be displayed, false otherwise.
   */
  public showVbsSubmitButton(): Observable<boolean> {
    return this._vbs.isOn;
  }

  /**
   * Invoked whenever a user clicks the actual tile; opens the QuickViewerComponent in a dialog.
   */
  public onTileClicked(event: MouseEvent) {
    if (event.shiftKey) {
      /* Shift-Click will trigger VBS submit. */
      this._vbs.submitSegment(this.segment);
    } else {
      /* Normal click will display item. */
      this._dialog.open(QuickViewerComponent, {data: this.segment});
      const context: Map<ContextKey, any> = new Map();
      context.set('i:mediasegment', this.segment.segmentId);
      this._eventBusService.publish(new InteractionEvent(new InteractionEventComponent(InteractionEventType.EXAMINE, context)))
    }
  }

  ngOnInit() {
  }

  /**
   * Whether the preview should play the video or not.
   * This **has** to be a lambda, as otherwise the scope would not be retained
   * @param segment
   */
  playVideo = (segment: MediaSegmentScoreContainer) => {
    return this._keyboardService.ctrlPressed.map(el => el && segment.objectScoreContainer.mediatype === 'VIDEO' && this.inFocus);
  };

  /**
   * Event handler when the video player is ready and eventually will seek to the segment's temporal position
   * @param api
   * @param segment
   */
  public onPlayerReady(api: VgApiService, segment: MediaSegmentScoreContainer) {
    api.getDefaultMedia().subscriptions.loadedData.pipe(first()).subscribe(() => this.seekToFocusPosition(api, segment));
  }

  /**
   * Seeks to the position of the focus segment. If that position is undefined, this method has no effect.
   */
  public seekToFocusPosition(api: VgApiService, segment: MediaSegmentScoreContainer) {
    if (segment) {
      api.seekTime(segment.startabs);
    }
  }


}
