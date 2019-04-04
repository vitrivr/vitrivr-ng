import {Component, Injectable, Input, OnInit} from '@angular/core';
import {BoolQueryTerm} from '../../../../shared/model/queries/bool-query-term.model';
import {BoolAttribute, BoolOperator, ValueType} from '../bool-attribute';
import {BehaviorSubject, Observable} from 'rxjs/Rx';
import {BoolTerm} from './bool-term';

@Component({
    selector: 'app-qt-bool-component',
    templateUrl: 'bool-term.component.html',
    styleUrls: ['bool-term.component.css']
})
@Injectable()
export class BoolTermComponent implements OnInit {

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
        new BehaviorSubject<BoolAttribute>(new BoolAttribute('debug-attribute', [BoolOperator.EQ], ValueType.TEXT));
    /** Current BoolTerm */
    private term: BoolTerm;
    /** Currently selected operator */
    currentOperator: BoolOperator;

    // TODO Currently slider values are not stored anywhere

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
        if (this.term == null) {
            return;
        }
        this.removeTermFromData();
    }

    private removeTermFromData() {
        const termIdx = this.boolTerm.terms.indexOf(this.term);
        if (termIdx > -1) {
            console.log('found query term to remove at index ' + termIdx + ', removing');
            this.boolTerm.terms.splice(termIdx, 1);
            this.boolTerm.data = JSON.stringify(this.boolTerm.terms);
        }
    }

    private addTermToData(value?: string) {
        this.term = new BoolTerm(this.currentAttributeObservable.getValue().attribute, this.currentOperator,
            value == null ? (this.term == null ? '' : this.term.value) : value);
        console.log('Adding new term: ' + JSON.stringify(this.term));
        this.boolTerm.terms.push(this.term);
        this.boolTerm.data = JSON.stringify(this.boolTerm.terms);
        console.log(JSON.stringify(this.boolTerm.data));
    }

    private updateTerms(value?: string) {
        if (this.term != null) {
            this.removeTermFromData();
        }
        this.addTermToData(value);
    }

    set attribute(value: BoolAttribute) {
        this.currentAttributeObservable.next(value);
        this.currentOperator = value.operators[0];
        this.updateTerms();
    }

    get attribute(): BoolAttribute {
        return this.currentAttributeObservable.getValue();
    }

    set operatorValue(value: BoolOperator) {
        this.currentOperator = value;
        this.updateTerms();
    }

    get operatorValue(): BoolOperator {
        if (this.currentOperator == null) {
            return BoolOperator.EQ;
        }
        return this.currentOperator;
    }

    /**
     * Setter for the data value of textTerm (for ngModel for input field).
     *
     * @param {string} value
     */
    set inputValue(value: string) {
        console.log('new input value: ' + value);
        this.updateTerms(value)
    }

    /**
     * Getter for the data value of textTerm (for ngModel for input field).
     * @return {string}
     */
    get inputValue(): string {
        if (this.term == null) {
            return '';
        }
        return this.term.value;
    }

    ngOnInit(): void {
        this.attribute = this.possibleAttributes[0];
    }
}
