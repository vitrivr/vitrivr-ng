import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {MediaObjectScoreContainer} from '../../shared/model/results/scores/media-object-score-container.model';
import {Observable} from 'rxjs';
import {ResultsContainer} from '../../shared/model/results/scores/results-container.model';
import {AbstractSegmentResultsViewComponent} from '../abstract-segment-results-view.component';
import {MediaSegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {EventBusService} from '../../core/basics/event-bus.service';
import {SelectionService} from '../../core/selection/selection.service';
import {FilterService} from '../../core/queries/filter.service';
import {QueryService} from '../../core/queries/query.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ResolverService} from '../../core/basics/resolver.service';
import {MatDialog} from '@angular/material/dialog';
import {VbsSubmissionService} from '../../core/vbs/vbs-submission.service';
import {AppConfig} from '../../app.config';
import {ScoredPathSegment} from '../temporal/scored-path-segment.model';

@Component({
  selector: 'app-list',
  templateUrl: 'list.component.html',
  styleUrls: ['list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent extends AbstractSegmentResultsViewComponent<MediaObjectScoreContainer[]> {

  /** Name of this ListComponent. */
  protected name = 'segment_list';

  constructor(_cdr: ChangeDetectorRef,
              _queryService: QueryService,
              _filterService: FilterService,
              _selectionService: SelectionService,
              _eventBusService: EventBusService,
              _configService: AppConfig,
              _router: Router,
              _snackBar: MatSnackBar,
              _resolver: ResolverService,
              _dialog: MatDialog
  ) {
    super(_cdr, _queryService, _filterService, _selectionService, _eventBusService, _router, _snackBar, _configService, _resolver, _dialog);
    this._count = this.scrollIncrement() * 5;
  }

  /**
   * Getter for the filters that should be applied to SegmentScoreContainer.
   */
  get objectFilter(): Observable<((v: MediaObjectScoreContainer) => boolean)[]> {
    return this._filterService.objectFilters;
  }

  /**
   * Getter for the filters that should be applied to SegmentScoreContainer.
   */
  get segmentFilter(): Observable<((v: MediaSegmentScoreContainer) => boolean)[]> {
    return this._filterService.segmentFilter;
  }

  /**
   * This is a helper method to facilitate updating the the list correct. It is necessary due to nesting in the template (two NgFor). To determine, whether to update the view,
   * angular only takes the outer observable into account. As long as this observable doesn't change, there is no update. Doe to the hierarchical nature of the data, it is -
   * however - entirely possible that the outer observable is not changed while segments are being added to the container.
   *
   * This function created a unique identifier per MediaObjectScoreContainer which takes the number of segments into account.
   *
   * @param index
   * @param {MediaObjectScoreContainer} item
   */
  public trackByFunction(index, item: MediaObjectScoreContainer) {
    return item.objectId + '_' + item.numberOfSegments;
  }

  public segmentTracking(index, item: MediaSegmentScoreContainer) {
    return item.segmentId
  }

  scrollIncrement(): number {
    return 100;
  }

  /**
   * Subscribes to the data exposed by the ResultsContainer.
   *
   * @return {Observable<MediaObjectScoreContainer>}
   */
  protected subscribe(results: ResultsContainer) {
    if (results) {
      this._dataSource = results.mediaobjectsAsObservable;
    }
  }
}
