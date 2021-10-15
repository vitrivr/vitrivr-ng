import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {QueryService} from '../../core/queries/query.service';
import {ResolverService} from '../../core/basics/resolver.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ResultsContainer} from '../../shared/model/results/scores/results-container.model';
import {SelectionService} from '../../core/selection/selection.service';
import {EventBusService} from '../../core/basics/event-bus.service';
import {FilterService} from '../../core/queries/filter.service';
import {AbstractSegmentResultsViewComponent} from '../abstract-segment-results-view.component';
import {AppConfig} from '../../app.config';
import {TemporalObjectSegments} from '../../shared/model/misc/temporalObjectSegments';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-temporal-list',
  templateUrl: 'temporal-list.component.html',
  styleUrls: ['temporal-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemporalListComponent extends AbstractSegmentResultsViewComponent<TemporalObjectSegments[]> {

  /** Name of this TemporalListComponent. */
  public static COMPONENT_NAME = 'temporal_list'
  protected name = TemporalListComponent.COMPONENT_NAME;
  public toggle = [];

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
    this._count = this.scrollIncrement() * 5;
  }

  scrollIncrement(): number {
    return 100;
  }

  toggleItem(index: number) {
    this.toggle[index] = !this.toggle[index];
  }

  getToggle(index: number): boolean {
    return this.toggle[index];
  }

  /**
   * Subscribes to the data exposed by the ResultsContainer.
   */
  protected subscribe(results: ResultsContainer) {
    if (results) {
      this.toggle = [];
      this._dataSource = results.temporalObjectsAsObservable.pipe(map(objects => {
        if (objects.length === 0) {
          return [];
        }
        for (let i = 0; i < objects.length; i++) {
          this.toggle.push(true);
        }
        return objects;
      }));
    }
  }

  /**
   * This is a helper method to facilitate updating the the list correct. It is necessary due to nesting in the template (two NgFor). To determine, whether to update the view,
   * angular only takes the outer observable into account. As long as this observable doesn't change, there is no update. Doe to the hierarchical nature of the data, it is -
   * however - entirely possible that the outer observable is not changed while segments are being added to the container.
   *
   * This function created a unique identifier per ScoredPathObjectContainer which takes the number of segments into account.
   *
   * @param index
   * @param {TemporalObjectSegments} item
   */
  public trackByFunction(index, item: TemporalObjectSegments) {
    return item.object.objectId + '_' + item.segments.length;
  }
}
