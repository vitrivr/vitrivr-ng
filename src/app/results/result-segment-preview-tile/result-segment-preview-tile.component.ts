import {Component, HostListener, Input, OnInit} from '@angular/core';
import {SegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {AbstractSegmentResultsViewComponent} from '../abstract-segment-results-view.component';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-result-segment-preview-tile',
  templateUrl: './result-segment-preview-tile.component.html',
  styleUrls: ['./result-segment-preview-tile.component.css']
})
export class ResultSegmentPreviewTileComponent implements OnInit {

  @Input() segment: SegmentScoreContainer;

  @Input() container: AbstractSegmentResultsViewComponent<SegmentScoreContainer[]>;

  private _ctrlPressed = new BehaviorSubject(false);

  constructor() {
  }

  ngOnInit() {
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
