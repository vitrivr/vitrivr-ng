import {Component, Input} from '@angular/core';
import {TagQueryTerm} from '../../../shared/model/queries/tag-query-term.model';
import {FormControl} from '@angular/forms';
import {EMPTY, Observable} from 'rxjs';
import {Tag} from '../../../shared/model/misc/tag.model';
import {TagsLookupService} from '../../../core/lookup/tags-lookup.service';
import {debounceTime, map, mergeAll, startWith} from 'rxjs/operators';
import {MatAutocompleteSelectedEvent} from '@angular/material';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'qt-tag',
  templateUrl: 'tag-query-term.component.html',
  styleUrls: ['tag-query-term.component.css']
})
export class TagQueryTermComponent {

  /** The TagQueryTerm object associated with this TagQueryTermComponent. That object holds all the query settings. */
  @Input()
  private tagTerm: TagQueryTerm;

  /**
   * Constructor for TagQueryTermComponent
   *
   * @param {TagsLookupService} _tagService Service used to load tags from Cineast.
   * @param {MatSnackBar} _matsnackbar The Snackbar to tell people they should really only use a tag once
   */
  constructor(_tagService: TagsLookupService, private _matsnackbar: MatSnackBar) {
    this._field = new FieldGroup(_tagService);
  }

  /** List of tag fields  currently displayed. */
  private _tags: Tag[] = [];

  /**
   * Getter for form control.
   *
   * @return {any}
   */
  get tags() {
    return this._tags;
  }

  /** List of tag fields  currently displayed. */
  private _field: FieldGroup;

  /**
   * Getter for form control.
   *
   * @return {any}
   */
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
      this.field.formControl.setValue('');
      this.tagTerm.data = 'data:application/json;base64,' + btoa(JSON.stringify(this._tags.map(v => {
        return v;
      })));
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
    this.tagTerm.data = 'data:application/json;base64,' + btoa(JSON.stringify(this._tags.map(v => {
      return v;
    })));
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

  /**
   * Constructor for FieldGroup
   *
   * @param {TagsLookupService} _tags
   */
  constructor(private _tags: TagsLookupService) {
    this.filteredTags = this.formControl.valueChanges.pipe(
      debounceTime(250),
      startWith(''),
      map((tag: string) => {
        if (tag.length >= 3) {
          return this._tags.matching(tag)
        } else {
          return EMPTY;
        }
      }),
      mergeAll()
    );
  }

  /** The currently selected tag. */
  private _selection: Tag;

  /**
   *
   * @return {Tag}
   */
  get selection(): Tag {
    return this._selection;
  }

  /**
   *
   * @param {Tag} value
   */
  set selection(value: Tag) {
    this._selection = value;
  }
}
