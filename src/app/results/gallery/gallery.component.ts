import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {MediaObjectScoreContainer} from '../../shared/model/results/scores/media-object-score-container.model';
import {QueryService} from '../../core/queries/query.service';
import {Router} from '@angular/router';
import {ResolverService} from '../../core/basics/resolver.service';
import {AbstractResultsViewComponent} from '../abstract-results-view.component';
import {MatSnackBar} from '@angular/material';
import {ResultsContainer} from '../../shared/model/results/scores/results-container.model';
import {SelectionService} from '../../core/selection/selection.service';
import {EventBusService} from '../../core/basics/event-bus.service';
import {FilterService} from '../../core/queries/filter.service';
import {Observable} from 'rxjs';

@Component({
  moduleId: module.id,
  selector: 'gallery',
  templateUrl: 'gallery.component.html',
  styleUrls: ['gallery.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent extends AbstractResultsViewComponent<MediaObjectScoreContainer[]> {
  /**
   * Default constructor.
   *
   * @param _cdr Reference to ChangeDetectorRef used to inform component about changes.
   * @param _queryService Reference to the singleton QueryService used to interact with the QueryBackend
   * @param _filterService
   * @param _selectionService Reference to the singleton SelectionService used for item highlighting.
   * @param _eventBusService Reference to the singleton EventBusService, used to listen to and emit application events.
   * @param _router The Router used for navigation
   * @param _snackBar The MatSnackBar component used to display the SnackBar.
   * @param _resolver
   * @param _historyService used to track changes to navigation
   */
  constructor(_cdr: ChangeDetectorRef, _queryService: QueryService, _filterService: FilterService, _selectionService: SelectionService, _eventBusService: EventBusService, _router: Router, _snackBar: MatSnackBar, protected _resolver: ResolverService) {
    super(_cdr, _queryService, _filterService, _selectionService, _eventBusService, _router, _snackBar);
  }

  /** Reference to the MediaObjectScoreContainer that is currently in focus. */
  protected _focus: MediaObjectScoreContainer;

  /**
   * Sets the focus to the provided MediaObjectScoreContainer.
   *
   * @param focus
   */
  set focus(focus: MediaObjectScoreContainer) {
    this._focus = focus;
  }

  /* The size of an individual tile in pixels. */
  private _tilesize: number = 250;

  /**
   * Getter for size of an individual tile in the gallery.
   *
   * @return {number}
   */
  get tilesize(): number {
    return this._tilesize;
  }

  /**
   * Adjusts the size of the tile to a new value. That value must be greater than 20. Calling this
   * method triggers an update of the component tree.
   *
   * @param {number} value
   */
  set tilesize(value: number) {
    if (value > 10) {
      this._tilesize = value;
    }
  }

  /* The gap between two tile in pixels. */
  private _tilegap: number = 15;

  /**
   * Getter for gap between two individual tiles in pixels.
   *
   * @return {number}
   */
  get tilegap(): number {
    return this._tilegap;
  }

  /**
   * Adjusts the size of the gap between tiles. That value must be greater than 2px. Calling this
   * method triggers an update of the component tree.
   *
   * @param {number} value
   */
  set tilegap(value: number) {
    if (value > 2) {
      this._tilegap = value;
    }
  }

  /**
   *
   */
  get filters(): Observable<((v: MediaObjectScoreContainer) => boolean)[]> {
    return this._filterService.objectFilters;
  }

  /**
   * Returns true, if the provided MediaObjectScoreContainer is currently
   * in focus and false otherwise.
   *
   * @param mediaobject
   * @return {boolean}
   */
  public inFocus(mediaobject: MediaObjectScoreContainer) {
    return this._focus == mediaobject;
  }

  scrollIncrement(): number {
    return 200;
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
