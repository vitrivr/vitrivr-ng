import {Component, Injectable, Input} from '@angular/core';
import {BoolQueryTerm} from '../../../../shared/model/queries/bool-query-term.model';
import {MatOptionSelectionChange} from '@angular/material/typings/core';
import {BoolAttribute, BoolOperator, ValueType} from '../bool-attribute';
import {BehaviorSubject, Observable} from 'rxjs/Rx';

@Component({
    selector: 'app-qt-bool-component',
    templateUrl: 'bool-term.component.html',
    styleUrls: ['bool-term.component.css']
})
@Injectable()
export class BoolTermComponent {

    // TODO add logic to store multiple queries with an OR
    /** This object holds all the query settings. */
    @Input()
    private boolTerm: BoolQueryTerm;

    @Input()
    public readonly containers: BoolTermComponent[];

    @Input()
    private readonly self: BoolTermComponent;

    @Input()
    private readonly possibleAttributes: BoolAttribute[];
    /** Current selection */
    private currentAttributeObservable: BehaviorSubject<BoolAttribute> =
        new BehaviorSubject<BoolAttribute>(new BoolAttribute('Select an attribute', [BoolOperator.EQ], ValueType.TEXT));

    public onChange(event: MatOptionSelectionChange) {
        if (!event.isUserInput) {
            // Information about what is no longer selected
            return;
        }
        const next = this.possibleAttributes.find((value => value.attribute === event.source.value));
        // TODO store in query container
        this.currentAttributeObservable.next(next);
    }

    get currentAttribute(): Observable<BoolAttribute> {
        return this.currentAttributeObservable;
    }

    public onRemoveButtonClicked() {
        console.log('removing this component from the list');
        const index = this.containers.indexOf(this.self);
        if (index > -1) {
            console.log('found at index ' + index);
            this.containers.splice(index, 1)
        }
    }

    /**
     * Setter for the data value of textTerm (for ngModel for input field).
     *
     * @param {string} value
     */
    set inputValue(value: string) {
        this.boolTerm.data = value;
    }

    /**
     * Getter for the data value of textTerm (for ngModel for input field).
     * @return {string}
     */
    get inputValue(): string {
        return this.boolTerm.data;
    }
}
