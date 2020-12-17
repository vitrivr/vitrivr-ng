import {Component, Input, OnInit} from '@angular/core';
import {TagQueryTerm} from '../../../shared/model/queries/tag-query-term.model';
import {FormControl} from '@angular/forms';
import {EMPTY, Observable} from 'rxjs';
import {debounceTime, first, map, mergeAll, startWith} from 'rxjs/operators';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Tag, TagService} from '../../../../../openapi/cineast';

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
  private readonly _field: FieldGroup;
  /** List of tag fields currently displayed. */
  private _tags: Tag[] = [];

  constructor(_tagService: TagService, private _matsnackbar: MatSnackBar) {
    this._field = new FieldGroup(_tagService);
  }

  ngOnInit(): void {
    if (this.tagTerm.data) {
      this._tags = this.tagTerm.tags;
    }
  }

  get tags() {
    return this._tags;
  }

  get field() {
    return this._field;
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
      this.field.formControl.setValue('');
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
    this._tags.push(tag);
    this.field.formControl.setValue('');
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

  private getAllTagsWithEqualName(tag: Tag): Tag[] {
    return this._field.currentlyDisplayedTags.filter(t => t.name === tag.name);
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
          return this._tags.findTagsBy('matchingname', tag).pipe(first()).map(res => res.tags);
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
