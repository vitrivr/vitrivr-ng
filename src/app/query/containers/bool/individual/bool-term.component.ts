import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {BoolQueryTerm} from '../../../../shared/model/queries/bool-query-term.model';
import {BoolAttribute, BoolOperator, InputType} from '../bool-attribute';
import {BehaviorSubject} from 'rxjs';
import {BoolTerm} from './bool-term';

@Component({
    selector: 'app-qt-bool-component',
    templateUrl: 'bool-term.component.html',
    styleUrls: ['bool-term.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoolTermComponent implements OnInit {

    // TODO add logic to store multiple queries with an OR
    /** This object holds all the query settings. */
    @Input() public boolTerm: BoolQueryTerm;

    @Input() public readonly possibleAttributes: BehaviorSubject<BoolAttribute[]>;

    /** Current selection */
    public _attribute: BehaviorSubject<BoolAttribute> = new BehaviorSubject<BoolAttribute>(null);

    /** Current BoolTerm */
    @Input() public term: BoolTerm;

    public _value: BehaviorSubject<any> = new BehaviorSubject('');
    public _operator: BehaviorSubject<BoolOperator> = new BehaviorSubject(BoolOperator.EQ)
    public _min: BehaviorSubject<number> = new BehaviorSubject(0)
    public _max: BehaviorSubject<number> = new BehaviorSubject(1)

    constructor(private cdr: ChangeDetectorRef) {
    }

    private updateRangeValue() {
        this._value.next([this._min.getValue(), this._max.getValue()])
    }

    /**
     * Removes this term from the term container, causing all views and data to be updated
     */
    public onRemoveButtonClicked() {
        this.boolTerm.removeTerm(this.term);
    }

    /**
     * Update with the provided new value. All values are serialized to Strings anyway :)
     */
    public updateTerm() {
        if (!this._attribute.getValue()) {
            return
        }
        this.term.attribute = this._attribute.getValue().featureName;
        this.term.operator = BoolAttribute.getOperatorName(this._operator.getValue());
        if (Array.isArray(this._value.getValue())) {
            this.term.values = this._value.getValue();
        } else {
            this.term.values = [this._value.getValue()]
        }
        this.boolTerm.update();
    }

    /**
     * Be aware that you should not use the setters in this method, because they will call an update() which will destroy cached term-information
     */
    ngOnInit(): void {
        this._value.subscribe(() => this.updateTerm())
        this._operator.subscribe(() => this.updateTerm())
        this._max.subscribe(() => {
                this.updateRangeValue();
                this.updateTerm()
            }
        )
        this._min.subscribe(() => {
            this.updateRangeValue();
            this.updateTerm()
        })
        this._attribute.subscribe(attr => {
            if (!attr) {
                return
            }
            this._operator.next(attr.operators[0]);
            this._value.next('');
            this.updateTerm();
        })

        /* Check if we need to initialize the attribute */
        if (!this.term.attribute) {
            this._attribute.next(this.possibleAttributes.getValue()[0])
        } else {
            const match = this.possibleAttributes.getValue().find(attr => attr.featureName === this.term.attribute);
            if (match) {
                this._attribute.next(match);
            } else {
                console.error(`no matching attribute found for term ${this.term} in attribute list ${this.possibleAttributes.getValue()}`)
            }
        }
        if (this.term.operator) {
            this._operator.next(BoolOperator[this.term.operator]);
        } else {
            this._operator.next(BoolAttribute.getDefaultOperatorsByValueType(this._attribute.getValue().inputType)[0]);
        }
        switch (this._attribute.getValue().inputType) {
            case InputType.MULTIOPTIONS:
                if (this.term.values) {
                    this._value.next(this.term.values)
                }
                break;
            case InputType.OPTIONS:
            case InputType.DYNAMICOPTIONS:
            case InputType.DATE:
            case InputType.NUMERIC:
            case InputType.TEXT:
                if (this.term.values && this.term.values !== []) {
                    this._value.next(this.term.values[0]);
                } else {
                    this._value.next('');
                }
                break;
            case InputType.RANGE:
                if (this.term.values && this.term.values !== [] && this.term.values[0] != "") {
                    const min = this.term.values[0];
                    const max = this.term.values[1];
                    this._min.next(min);
                    this._max.next(max);
                } else {
                    this._min.next(this._attribute.getValue().minValue);
                    this._max.next(this._attribute.getValue().maxValue);
                }
                break;
        }
        if (this._attribute.getValue().inputType === InputType.RANGE) {
            this.updateRangeValue();
        }
        this.updateTerm();
    }

    onChange() {
        this.updateTerm()
    }
}
