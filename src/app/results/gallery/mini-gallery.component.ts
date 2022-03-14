import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {MediaObjectScoreContainer} from '../../shared/model/results/scores/media-object-score-container.model';
import {MediaSegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {Observable} from 'rxjs';
import {ResultsContainer} from '../../shared/model/results/scores/results-container.model';
import {AbstractSegmentResultsViewComponent} from '../abstract-segment-results-view.component';
import {QueryService} from '../../core/queries/query.service';
import {SelectionService} from '../../core/selection/selection.service';
import {FilterService} from '../../core/queries/filter.service';
import {EventBusService} from '../../core/basics/event-bus.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ResolverService} from '../../core/basics/resolver.service';
import {MatDialog} from '@angular/material/dialog';
import {AppConfig} from '../../app.config';

@Component({

  selector: 'app-mini-gallery',
  templateUrl: 'mini-gallery.component.html',
  styleUrls: ['mini-gallery.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiniGalleryComponent extends AbstractSegmentResultsViewComponent<MediaSegmentScoreContainer[]> {

  /** Name of this MiniGalleryComponent. */
  protected name = 'segment_gallery';

  constructor(_cdr: ChangeDetectorRef,
              _queryService: QueryService,
              _filterService: FilterService,
              _selectionService: SelectionService,
              _eventBusService: EventBusService,
              _router: Router,
              _snackBar: MatSnackBar,
              _configService: AppConfig,
              _resolver: ResolverService,
              _dialog: MatDialog) {
    super(_cdr, _queryService, _filterService, _selectionService, _eventBusService, _router, _snackBar, _configService, _resolver, _dialog);
  }

  public segmentTracking(index, item: MediaSegmentScoreContainer) {
    return item.segmentId
  }

  scrollIncrement(): number {
    return 500;
  }

  /**
   * Subscribes to the data exposed by the ResultsContainer.
   *
   * @return {Observable<MediaObjectScoreContainer>}
   */
  protected subscribe(results: ResultsContainer) {
    if (results) {
      this._dataSource = results.segmentsAsObservable;
    }
  }
}
