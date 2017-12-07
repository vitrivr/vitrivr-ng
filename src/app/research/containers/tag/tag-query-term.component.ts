import {Component, Input, ViewChild} from "@angular/core";
import {TagQueryTerm} from "../../../shared/model/queries/tag-query-term.model";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {Tag} from "../../../shared/model/misc/tag.model";
import {TagsService} from "../../../core/queries/tags.service";
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

@Component({
    selector: 'qt-tag',
    templateUrl: 'tag-query-term.component.html',
    styleUrls: ['tag-query-term.component.css']
})
export class TagQueryTermComponent {
    /** The TagQueryTerm object associated with this TagQueryTermComponent. That object holds all the query settings. */
    @Input()
    private tagTerm: TagQueryTerm;

    @ViewChild('input')
    private _input: any;

    /** List of tag fields  currently displayed. */
    private _field: FieldGroup;

    /** List of tag fields  currently displayed. */
    private _tags: Tag[] = [];

    /**
     * Constructor for TagQueryTermComponent
     *
     * @param {TagsService} _tagService Service used to load tags from Cineast.
     */
    constructor(_tagService: TagsService) {
        this._field = new FieldGroup(_tagService);
    }

    /**
     * Getter for form controll.
     *
     * @return {any}
     */
    get field() {
        return this._field;
    }

    /**
     * Getter for form controll.
     *
     * @return {any}
     */
    get tags() {
        return this._tags;
    }

    /**
     * Invoked whenever the user selects a Tag from the list.
     *
     * @param {Tag} tag The selected tag.
     */
    public onTagSelected(tag: Tag) {
        this.addTag(tag);
        this._input.nativeElement.value = "";
        this.tagTerm.data = "data:application/json;base64," + btoa(JSON.stringify(this._tags.map(v => {return v;})));
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
        let index = this._tags.indexOf(tag);
        if (index > -1) {
            this._tags.splice(index, 1);
        }
    }
}

/**
 * Groups the FormControl and the data source Observable of a specific tag field.
 */
export class FieldGroup {


    /** The FormControl used to control the tag field. */
    public readonly formControl: FormControl;

    /** The Observable that acts as data source for the field. */
    public readonly filteredTags: Observable<Tag[]>;

    /** The currently selected tag. */
    private _selection: Tag;

    /**
     * Constructor for FieldGroup
     *
     * @param {TagsService} _tags
     */
    constructor(private _tags: TagsService) {
        this.formControl = new FormControl();
        this.filteredTags = this.formControl.valueChanges.debounceTime(250).pipe(startWith(''), map((tag: string) => {
            if (tag.length >= 3) {
                return this._tags.filtered(tag)
            } else {
                return Observable.empty<Tag[]>();
            }
        })).mergeAll();
    }

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