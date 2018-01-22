import {ChangeDetectionStrategy, Component} from "@angular/core";
import {SelectionService} from "../../core/selection/selection.service";
import {Observable} from "rxjs/Observable";
import {Tag} from "../../core/selection/tag.model";

@Component({
    moduleId: module.id,
    selector: 'selection-management',
    templateUrl: './selection-management.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectionManagementComponent {

    /** */
    private _observable: Observable<Map<string,Set<Tag>>>;

    /**
     * Constructor for SelectionManagementComponent
     *
     * @param {SelectionService} _selectionServce
     */
    constructor(private _selectionService: SelectionService) {
        this._observable = _selectionService.asObservable();
    }

    /**
     * Invoked when a user clicks the 'Remove tag' button. Removes the selected tag from the selected item.
     */
    public onTagButtonClicked(selection: string, tag: Tag) {
        this._selectionService.remove(selection, tag);
    }

    /**
     * Invoked when a user clicks the 'Clear' button. Clears all selections.
     */
    public onClearSelectionClicked() {
       this._selectionService.clear();
    }

    /**
     * Getter for the observable.
     *
     * @return {Observable<Map<string, Set<Tag>>>}
     */
    get selection(): Observable<Map<string,Set<Tag>>> {
        return this._observable;
    }
}