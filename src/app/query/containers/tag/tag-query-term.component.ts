import {Component, Injectable, Input, OnInit} from '@angular/core';
import {TagQueryTerm} from '../../../shared/model/queries/tag-query-term.model';
import {FormControl} from '@angular/forms';
import {EMPTY, Observable} from 'rxjs';
import {Preference} from '../../../shared/model/misc/tag.model';
import {debounceTime, first, map, mergeAll, startWith} from 'rxjs/operators';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Tag, TagService} from '../../../../../openapi/cineast';
import PriorityEnum = Tag.PriorityEnum;

import {ResultSetInfoService} from '../../../core/queries/result-set-info.service';


@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-qt-tag',
  templateUrl: 'tag-query-term.component.html',
  styleUrls: ['tag-query-term.component.css']
})
export class TagQueryTermComponent implements OnInit {

  /**
   * make enum available in html https://stackoverflow.com/questions/44045311/cannot-approach-typescript-enum-within-html
   */
  Preference = Preference;
  /** The TagQueryTerm object associated with this TagQueryTermComponent. That object holds all the query settings. */
  @Input()
  private tagTerm: TagQueryTerm;
  /** List of tag fields currently displayed. */
  readonly _field: FieldGroup;

  constructor(_tagService: TagService, private _matsnackbar: MatSnackBar, private _resultSetInfoService: ResultSetInfoService) {
    this._field = new FieldGroup(_tagService);
  }

  /** List of tag fields currently displayed. */
  _tags: Tag[] = [];

  get tags() {
    return this._tags;
  }

  get field() {
    return this._field;
  }

  ngOnInit(): void {
    if (this.tagTerm.data) {
      this._tags = this.tagTerm.tags;
    }
    /*
    NOTE: Uncommented since tag preferences are not yet OpenApi supported.
    this._resultSetInfoService.currentNewTagForQuery.subscribe(message => {
      if (message) {
        this.addTag(message);
      }
    });
     */
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
    /*
    NOTE: Uncommented since tag preferences are not yet OpenApi supported.
    if (!tag.preference) {
      tag.preference = Preference.COULD;
    }
     */
    this._tags.push(tag);
    this._field.formControl.setValue('');
    this.tagTerm.tags = this._tags;
    this.tagTerm.data = 'data:application/json;base64,' + btoa(JSON.stringify(this._tags.map(v => {
      return v;
    })));
    this.sortTagsByPreference();
  }

  /**
   * Adds the specified collection of tags to the list of tags
   * @param {Tag[]} tags The tags to be added
   */
  public addTags(tags: Tag[]) {
    tags.forEach(tag => {
      /*
      NOTE: Uncommented since tag preferences are not yet OpenApi supported.
      tag.preference = Preference.COULD;
       */
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

  /*
  public onPreferenceChange(preference: Preference, tag): void
  NOTE: Uncommented since tag preferences are not yet OpenApi supported.
    tag.preference = preference;
    this.tagTerm.data = 'data:application/json;base64,' + btoa(JSON.stringify(this._tags.map(v => {
      return v;
    })));
    this.sortTagsByPreference();
  }

  ifPreferenceExists(tag): boolean {
    return tag.preference != null;
  }
   */


  private sortTagsByPreference(): void {
    /*
    NOTE: Uncommented since tag preferences are not yet OpenApi supported.
    const sort = this._tags.sort(function (a, b) {
      return a.preference > b.preference ? 1 : a.preference < b.preference ? -1 : 0
    });
     */
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

  /** The currently selected tag. */
  private _selection: Tag;

  get selection(): Tag {
    return this._selection;
  }

  set selection(value: Tag) {
    this._selection = value;
  }
}
