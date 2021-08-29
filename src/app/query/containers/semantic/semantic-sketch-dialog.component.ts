import {AfterViewInit, Component, Inject, OnInit, Optional, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SketchCanvasComponent} from '../../../shared/components/sketch/sketch-canvas.component';
import {SemanticCategory} from '../../../shared/model/queries/semantic/semantic-category.model';
import {SemanticMap} from '../../../shared/model/queries/semantic/semantic-map.model';
import {FormControl} from '@angular/forms';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {startWith} from 'rxjs/operators';
import {map} from 'rxjs/internal/operators/map';

@Component({

  selector: 'app-semantic-sketchpad',
  templateUrl: 'semantic-sketch-dialog.component.html',
  styleUrls: ['semantic-sketch-dialog.component.css']
})
export class SemanticSketchDialogComponent implements OnInit, AfterViewInit {
  /** Default line size when opening the dialog. */
  public static readonly DEFAULT_LINESIZE = 10.0;

  /** FormControl instance used to steer auto complete. */
  public readonly formCtrl = new FormControl();
  /** Current line size (default: DEFAULT_LINESIZE). */
  public linesize: number = SemanticSketchDialogComponent.DEFAULT_LINESIZE;
  /** Observable for all the SemanticCategories (filtered and ordered). */
  private readonly _filteredCategories: Observable<SemanticCategory[]>;
  /** Observable for all currently used SemanticCategories. */
  private _used: BehaviorSubject<SemanticCategory[]> = new BehaviorSubject([]);
  /** Hidden input for image upload. */
  @ViewChild('imageloader')
  private imageloader: any;
  /** Sketch-canvas component. */
  @ViewChild('sketch')
  private _sketchpad: SketchCanvasComponent;

  /** List of all SemanticCategories. */
  private _categories: SemanticCategory[] = SemanticCategory.LIST;

  /** Currently selected SemanticCategory (pencil) */
  private _selected: SemanticCategory = this._categories[0];

  /**
   *
   * @param _dialogRef
   * @param _data
   */
  constructor(private _dialogRef: MatDialogRef<SemanticSketchDialogComponent>, @Optional() @Inject(MAT_DIALOG_DATA) private _data: SemanticMap) {
    _dialogRef.disableClose = true;
    const filtered = this.formCtrl.valueChanges.pipe(
      startWith(''),
      map(filter => filter.toLowerCase()),
      map(filter => {
        if (filter) {
          return this._categories.filter(v => v.name.toLowerCase().indexOf(filter) === 0);
        } else {
          return this._categories;
        }
      })
    );
    this._filteredCategories = combineLatest(filtered, this._used).pipe(
      map((array: [SemanticCategory[], SemanticCategory[]]) => {
        return array[0].sort((a, b) => {
          const ia = array[1].indexOf(a);
          const ib = array[1].indexOf(b);
          if (ia === -1 && ib !== -1) {
            return 1;
          } else if (ia !== -1 && ib === -1) {
            return -1;
          } else if (a.name < b.name) {
            return -1
          } else if (a.name > b.name) {
            return 1;
          } else {
            return 0;
          }
        })
      })
    );
  }

  /**
   * Returns the list of SemanticCategories (ordered by selection).
   */
  get categories(): Observable<SemanticCategory[]> {
    return this._filteredCategories;
  }

  /**
   * Getter for selected.
   */
  get selected(): SemanticCategory {
    return this._selected;
  }

  /**
   * Lifecycle Hook (onInit): Loads the injected image data (if specified).
   */
  public ngOnInit(): void {
    if (this._data) {
      this._sketchpad.setImageBase64(this._data.image);
      this._used.next(this._data.map);
      this._data = null;
    }
  }

  /**
   * Lifecycle Hook (afterViewInit): Sets the default linesize and colour.
   */
  public ngAfterViewInit(): void {
    this._sketchpad.setLineSize(this.linesize);
  }

  /**
   * Returns true if SemanticCategory is in use and false otherwise.
   *
   * @param selection SemanticCategory
   */
  public inUse(selection: SemanticCategory): Observable<boolean> {
    return this._used.pipe(
      map(u => u.indexOf(selection) > -1)
    );
  }

  /**
   * Triggered when a color value is _selected.
   *
   * @param selection onItemSelected(selection: SemanticCategory) {

   */
  public onItemSelected(selection: SemanticCategory) {
    this._selected = selection;
    this._sketchpad.setActiveColor(selection.color);
    const arr = this._used.getValue().concat().slice();
    if (arr.indexOf(selection) === -1) {
      arr.push(selection);
      this._used.next(arr);
    }
  }

  /**
   * Triggered when the slider-value for the line-size changes.
   */
  public onLineSizeChange() {
    this._sketchpad.setLineSize(this.linesize);
  }

  /**
   * Triggered when the 'Clear canvas' menu-item is pressed.
   *
   * Clears the canvas
   */
  public onClearCanvasClicked() {
    this._sketchpad.clearCanvas();
    this._used.next([]);
  }

  /**
   * Triggered when the 'Fill canvas' menu-item is pressed.
   *
   * Fills the canvas with the default color.
   */
  public onFillCanvasClicked() {
    this._sketchpad.fillCanvas();
  }

  /**
   *
   * @param selected
   */
  public onOptionSelected(selected: string) {
    for (const category of this._categories) {
      if (category.name === selected) {
        this.onItemSelected(category);
        break;
      }
    }
  }

  /**
   * Closes the dialog.
   */
  public close() {
    this._dialogRef.close(new SemanticMap(this._sketchpad.getImageBase64(), this._used.getValue()));
  }
}
