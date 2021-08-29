import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {QueryService} from '../../core/queries/query.service';
import {ResolverService} from '../../core/basics/resolver.service';
import {Router} from '@angular/router';
import {MediaSegmentScoreContainer} from '../../shared/model/results/scores/segment-score-container.model';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable} from 'rxjs';
import {VbsSubmissionService} from 'app/core/vbs/vbs-submission.service';
import {ResultsContainer} from '../../shared/model/results/scores/results-container.model';
import {SelectionService} from '../../core/selection/selection.service';
import {EventBusService} from '../../core/basics/event-bus.service';
import {FilterService} from '../../core/queries/filter.service';
import {TemporalFusionFunction} from '../../shared/model/results/fusion/temporal-fusion-function.model';
import {ScoredPath} from './scored-path.model';
import {AbstractSegmentResultsViewComponent} from '../abstract-segment-results-view.component';
import {ScoredPathObjectContainer} from './scored-path-object-container.model';
import {ScoredPathSegment} from './scored-path-segment.model';
import {AppConfig} from '../../app.config';

@Component({

  selector: 'app-temporal-list',
  templateUrl: 'temporal-list.component.html',
  styleUrls: ['temporal-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemporalListComponent extends AbstractSegmentResultsViewComponent<ScoredPathObjectContainer[]> {
  /** Reference to the temporal fusion function */
  private _fusion = TemporalFusionFunction.instance();

  /** Name of this TemporalListComponent. */
  protected name = 'temporal_list';

  constructor(_cdr: ChangeDetectorRef,
              _queryService: QueryService,
              _filterService: FilterService,
              _selectionService: SelectionService,
              _eventBusService: EventBusService,
              _configService: AppConfig,
              _router: Router,
              _snackBar: MatSnackBar,
              _resolver: ResolverService,
              _dialog: MatDialog) {
    super(_cdr, _queryService, _filterService, _selectionService, _eventBusService, _router, _snackBar, _configService, _resolver, _dialog);
  }

  /**
   * Getter for the filters that should be applied to SegmentScoreContainer.
   * Returns true for all objects that should be included
   */
  get scoredPathFilter(): Observable<((v: ScoredPath) => boolean)[]> {
    return this._filterService.objectFilters.map(filters =>
      filters.map(filter => function (scoredPath: ScoredPath): boolean {
        let good = true;
        scoredPath.path.pathMap.forEach(value => {
          if (filter(value.objectScoreContainer)) {
            return;
          }
          good = false;
        });
        return good;
      })
    );
  }

  /**
   * Getter for the filters that should be applied to SegmentScoreContainer.
   * Returns true for all objects that should be included
   */
  get objectFilter(): Observable<((v: ScoredPathObjectContainer) => boolean)[]> {
    return this._filterService.objectFilters.map(filters =>
      filters.map(filter => function (scoredPathContainer: ScoredPathObjectContainer): boolean {
        return filter(scoredPathContainer.objectScoreContainer);
      })
    );
  }

  /**
   * Getter for the filters that should be applied to SegmentScoreContainer.
   */
  get segmentFilter(): Observable<((v: MediaSegmentScoreContainer) => boolean)[]> {
    return this._filterService.segmentFilter;
  }

  get pathSegmentFilter(): Observable<((v: ScoredPathSegment) => boolean)[]> {
    return null;
  }

  scrollIncrement(): number {
    return 100;
  }

  /**
   * Subscribes to the data exposed by the ResultsContainer.
   */
  protected subscribe(results: ResultsContainer) {
    if (results) {
      this._fusion.reset();
      this._dataSource = results.mediaobjectsAsObservable.map(objects => {
        if (objects.length === 0) {
          return [];
        }
        return objects.map(
          object => new ScoredPathObjectContainer(object, Array.from(this._fusion.computePaths(results.features, object).values()))
        );
      });
    }
  }
}
