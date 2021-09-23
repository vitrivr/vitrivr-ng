import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SelectionService} from '../../core/selection/selection.service';
import {Tag} from '../../core/selection/tag.model';
import {QueryService} from '../../core/queries/query.service';

@Component({
  selector: 'app-selection-management',
  templateUrl: './selection-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectionManagementComponent {

  _selection: Map<string, Set<Tag>>;

  /**
   * Constructor for SelectionManagementComponent
   *
   * @param _selectionService Reference to SelectionService (by injection).
   * @param _queryService Reference to QueryService (by injection).
   */
  constructor(private _selectionService: SelectionService, private _queryService: QueryService) {
    _selectionService.asObservable().subscribe(el => this._selection = el)
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
