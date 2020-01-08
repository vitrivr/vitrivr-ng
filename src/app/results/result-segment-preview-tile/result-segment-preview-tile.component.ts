import {Component, Input, OnInit} from '@angular/core';
import {SegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {AbstractSegmentResultsViewComponent} from '../abstract-segment-results-view.component';
import {VgAPI} from 'videogular2/core';
import {first} from 'rxjs/operators';
import {KeyboardService} from '../../core/basics/keyboard.service';

/**
 * Dedicated component for the preview of a segment.
 *
 * Handles everything related to that.
 */
@Component({
  selector: 'app-result-segment-preview-tile',
  templateUrl: './result-segment-preview-tile.component.html',
  styleUrls: ['./result-segment-preview-tile.component.css']
})
export class ResultSegmentPreviewTileComponent implements OnInit {

  /**
   * The segment this preview is for
   */
  @Input() segment: SegmentScoreContainer;

  /**
   * The container this segment preview is in
   */
  @Input() container: AbstractSegmentResultsViewComponent<SegmentScoreContainer[]>;

  /**
   * The score of the segment. Will be used for the coloring of the background.
   *
   * We implemented the temporal scoring view, where the score is not the segment score - otherwise this is should be equivalent to segment.score
   */
  @Input() score: number;

  constructor(private _keyboardService: KeyboardService) {
  }

  /**
   * A flag whether this preview is in focus or not.
   */
  private _focus = false;

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

  ngOnInit() {
  }

  /**
   * Whether the preview should play the video or not.
   * This **has** to be a lambda, as otherwise the scope would not be retained
   * @param segment
   */
  playVideo = (segment: SegmentScoreContainer) => {
    return this._keyboardService.ctrlPressed.map(el => el && segment.objectScoreContainer.mediatype === 'VIDEO' && this.inFocus);
  };

  /**
   * Event handler when the video player is ready and eventually will seek to the segment's temporal position
   * @param api
   * @param segment
   */
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


}
