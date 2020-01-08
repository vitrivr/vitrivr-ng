import {Component, Input, OnInit} from '@angular/core';
import {SegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {AbstractSegmentResultsViewComponent} from '../abstract-segment-results-view.component';
import {Observable} from 'rxjs';
import {VgAPI} from 'videogular2/core';
import {first} from 'rxjs/operators';
import {KeyboardService} from '../../core/basics/keyboard.service';

@Component({
  selector: 'app-result-segment-preview-tile',
  templateUrl: './result-segment-preview-tile.component.html',
  styleUrls: ['./result-segment-preview-tile.component.css']
})
export class ResultSegmentPreviewTileComponent implements OnInit {

  @Input() segment: SegmentScoreContainer;

  @Input() container: AbstractSegmentResultsViewComponent<SegmentScoreContainer[]>;

  @Input() score: number;

  constructor(private _keyboardService: KeyboardService) {
  }

  public get id(): string {
    return this.segment.segmentId;
  }

  ngOnInit() {
  }

  playVideo = (segment: SegmentScoreContainer) => {
    return this._keyboardService.ctrlPressed.map(el => el && segment.objectScoreContainer.mediatype === 'VIDEO' && this.container.inFocus(segment));
  };

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
