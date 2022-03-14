import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {TagQueryTerm} from '../../../shared/model/queries/tag-query-term.model';
import {FormControl} from '@angular/forms';
import {EMPTY, Observable} from 'rxjs';
import {debounceTime, first, map, mergeAll, startWith} from 'rxjs/operators';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Tag, TagService} from '../../../../../openapi/cineast';
import PriorityEnum = Tag.PriorityEnum;
import {AppConfig} from '../../../app.config';
import {MatMenu} from '@angular/material/menu';

@Component({
  selector: 'app-qt-tag',
  templateUrl: 'tag-query-term.component.html',
  styleUrls: ['tag-query-term.component.css']
})
export class TagQueryTermComponent implements OnInit {

  /** The TagQueryTerm object associated with this TagQueryTermComponent. That object holds all the query settings. */
  @Input()
  private tagTerm: TagQueryTerm;

  /** List of tag fields currently displayed. */
  readonly _field: FieldGroup;
  /** List of tag fields currently displayed. */
  _tags: Tag[] = [];

  @ViewChild(MatMenu, {static: true}) menu: MatMenu;

  constructor(_tagService: TagService, private _matsnackbar: MatSnackBar, public config: AppConfig) {
    this._field = new FieldGroup(_tagService);
  }

  ngOnInit(): void {
    if (this.tagTerm.data) {
      this._tags = this.tagTerm.tags;
    }
  }

  /**
   * Invoked whenever the user selects a Tag from the list.
   *
   * @param {MatAutocompleteSelectedEvent} event The selection event.
   */
  public onTagSelected(event: MatAutocompleteSelectedEvent) {
    let tagAlreadyInList = false;
    for (const existing of this._tags) {
      if (existing.id === event.option.value.id) {
        tagAlreadyInList = true;
      }
    }
    if (!tagAlreadyInList) {
      this.addTag(event.option.value);
    } else {
      this._field.formControl.setValue('');
      this._matsnackbar.open(`Tag ${event.option.value.name} (${event.option.value.id}) already added`, null, {
        duration: 2000,
      });
    }
  }

  /**
   * Add the specified tag to the list of tags.
   *
   * @param {Tag} tag The tag that should be added.
   */
  public addTag(tag: Tag) {
    if (!tag.priority) {
      tag.priority = PriorityEnum.Request
    }
    this._tags.push(tag);
    this._field.formControl.setValue('');
    this.tagTerm.tags = this._tags;
    this.tagTerm.data = 'data:application/json;base64,' + btoa(JSON.stringify(this._tags.map(v => {
      return v;
    })));
  }

  /**
   * Adds the specified collection of tags to the list of tags
   * @param {Tag[]} tags The tags to be added
   */
  public addTags(tags: Tag[]) {
    tags.forEach(tag => {
      this.addTag(tag);
    })
  }

  /**
   * Removes the specified tag from the list of tags.
   *
   * @param {Tag} tag The tag that should be removed.
   */
  public removeTag(tag: Tag) {
    const index = this._tags.indexOf(tag);
    if (index > -1) {
      this._tags.splice(index, 1);
    }
    this.tagTerm.tags = this._tags;
    this.tagTerm.data = 'data:application/json;base64,' + btoa(JSON.stringify(this._tags.map(v => {
      return v;
    })));
  }

  /**
   * Stores values for preference set for a tag in a Map<String, String>
   */
  public onPriorityChange(priority: PriorityEnum, tag): void {
    tag.priority = priority;
    this.tagTerm.data = 'data:application/json;base64,' + btoa(JSON.stringify(this._tags.map(v => {
      return v;
    })));
    this.sortTagsByPreference();
  }


  private sortTagsByPreference(): void {
    const sort = this._tags.sort(function (a, b) {
      return a.priority > b.priority ? -1 : a.priority < b.priority ? 1 : 0
    })
  }
}

/**
 * Groups the FormControl and the data source Observable of a specific tag field.
 */
export class FieldGroup {
  /** The FormControl used to control the tag field. */
  public readonly formControl: FormControl = new FormControl();

  /** The Observable that acts as data source for the field. */
  public readonly filteredTags: Observable<Tag[]>;

  public currentlyDisplayedTags: Array<Tag> = new Array<Tag>();

  /** The currently selected tag. */
  private _selection: Tag;

  constructor(private _tags: TagService) {
    this.filteredTags = this.formControl.valueChanges.pipe(
      debounceTime(250),
      startWith(''),
      map((tag: string) => {
        if (tag.length >= 3) {
          return this._tags.findTagsBy('matchingname', tag).pipe(first(), map(res => res.tags));
        } else {
          return EMPTY;
        }
      }),
      mergeAll()
    );
    this.filteredTags.subscribe(value => {
      this.currentlyDisplayedTags = new Array<Tag>();
      value.forEach(t => this.currentlyDisplayedTags.push(t))
    });
  }

  get selection(): Tag {
    return this._selection;
  }

  set selection(value: Tag) {
    this._selection = value;
  }
}
