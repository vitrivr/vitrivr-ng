import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SelectionService} from '../../core/selection/selection.service';
import {Observable} from 'rxjs';
import {Tag} from '../../core/selection/tag.model';
import {QueryService} from '../../core/queries/query.service';

@Component({

  selector: 'selection-management',
  templateUrl: './selection-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectionManagementComponent {

  /** */
  private _observable: Observable<Map<string, Set<Tag>>>;

  /**
   * Constructor for SelectionManagementComponent
   *
   * @param _selectionService Reference to SelectionService (by injection).
   * @param _queryService Reference to QueryService (by injection).
   */
  constructor(private _selectionService: SelectionService, private _queryService: QueryService) {
    this._observable = _selectionService.asObservable();
  }

  /**
   * Getter for the observable.
   *
   * @return {Observable<Map<string, Set<Tag>>>}
   */
  get selection(): Observable<Map<string, Set<Tag>>> {
    return this._observable;
  }

  /**
   * Invoked when a user clicks a tagged segment. Performs a lookup for that segment.
   *
   * @param selection The selection, usually the segment ID.
   */
  public onSegmentClicked(selection: string) {
    this._queryService.lookupSegment(selection);
  }

  /**
   * Invoked when a user clicks the 'Remove tag' button. Removes the selected tag from the selected item.
   *
   * @param selection The selection, usually the segment ID.
   * @param tag The tag that was clicked.
   */
  public onTagButtonClicked(selection: string, tag: Tag) {
    this._selectionService.remove(tag, selection);
  }

  /**
   * Invoked when a user clicks the 'Clear' button. Clears all selections.
   */
  public onClearSelectionClicked() {
    this._selectionService.clear();
  }
}
