import {Observable} from 'rxjs';
import {MediaSegmentScoreContainer} from '../shared/model/results/scores/segment-score-container.model';
import {ResultsContainer} from '../shared/model/results/scores/results-container.model';
import {AbstractResultsViewComponent} from './abstract-results-view.component';
import { ChangeDetectorRef, Directive } from '@angular/core';
import {QueryService} from '../core/queries/query.service';
import {FilterService} from '../core/queries/filter.service';
import {SelectionService} from '../core/selection/selection.service';
import {EventBusService} from '../core/basics/event-bus.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ResolverService} from '../core/basics/resolver.service';
import {MatDialog} from '@angular/material/dialog';
import {VbsSubmissionService} from '../core/vbs/vbs-submission.service';
import {AppConfig} from '../app.config';

/**
 * More specialized AbstractResultsView, tailored for views which display segments
 */
@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class AbstractSegmentResultsViewComponent<T> extends AbstractResultsViewComponent<T> {

  protected constructor(_cdr: ChangeDetectorRef,
                        _queryService: QueryService,
                        _filterService: FilterService,
                        _selectionService: SelectionService,
                        _eventBusService: EventBusService,
                        _router: Router,
                        _snackBar: MatSnackBar,
                        protected _configService: AppConfig,
                        public _resolver: ResolverService,
                        protected _dialog: MatDialog) {
    super(_cdr, _queryService, _filterService, _selectionService, _eventBusService, _router, _snackBar);
  }


  /**
   * Subscribes to the data exposed by the ResultsContainer.
   *
   * @return {Observable<MediaObjectScoreContainer>}
   */
  protected abstract subscribe(results: ResultsContainer): void;


}
