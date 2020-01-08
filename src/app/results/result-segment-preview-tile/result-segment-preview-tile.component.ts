import {Component, HostListener, Input, OnInit} from '@angular/core';
import {SegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {AbstractSegmentResultsViewComponent} from '../abstract-segment-results-view.component';
import {BehaviorSubject, Observable} from 'rxjs';
import {VgAPI} from 'videogular2/core';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-result-segment-preview-tile',
  templateUrl: './result-segment-preview-tile.component.html',
  styleUrls: ['./result-segment-preview-tile.component.css']
})
export class ResultSegmentPreviewTileComponent implements OnInit {

  @Input() segment: SegmentScoreContainer;

  @Input() container: AbstractSegmentResultsViewComponent<SegmentScoreContainer[]>;

  @Input() score: number;

  private _ctrlPressed = new BehaviorSubject(false);

  constructor() {
  }

  ngOnInit() {
  }

  playVideo(segment: SegmentScoreContainer): Observable<boolean> {
    return this._ctrlPressed.map(el => el && segment.objectScoreContainer.mediatype === 'VIDEO' && this.container.focus === segment);
  }

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

  @HostListener('document:keydown', ['$event'])
  onKeyDown($event: KeyboardEvent) {
    if ($event.ctrlKey) {
      this._ctrlPressed.next(true);
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp($event: KeyboardEvent) {
    if ($event.key === 'Control') {
      this._ctrlPressed.next(false);
    }
  }
}
