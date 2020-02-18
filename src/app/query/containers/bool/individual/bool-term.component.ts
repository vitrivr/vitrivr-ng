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
  @Input() public boolTerm: BoolQueryTerm;

  @Input() public readonly possibleAttributes: BehaviorSubject<BoolAttribute[]>;

  /** Current selection */
  public currentAttributeObservable: BehaviorSubject<BoolAttribute> =
    new BehaviorSubject<BoolAttribute>(new BoolAttribute('debug-attribute', 'features.debug', ValueType.TEXT));

  /** Current BoolTerm */
  @Input() public term: BoolTerm;

  /** Currently selected operator */
  currentOperator: BoolOperator;
  // TODO Currently slider values are not stored anywhere

  private _value: string;

  get currentAttribute(): Observable<BoolAttribute> {
    return this.currentAttributeObservable;
  }

  get attribute(): BoolAttribute {
    return this.currentAttributeObservable.getValue();
  }

  set attribute(value: BoolAttribute) {
    this.currentAttributeObservable.next(value);
    this.currentOperator = value.operators[0];
    this.updateTerm();
  }

  /**
   * By default, the operator is set to equals since that is supported by all boolean types
   */
  get operatorValue(): BoolOperator {
    if (this.currentOperator == null) {
      return BoolOperator.EQ;
    }
    return this.currentOperator;
  }

  /**
   * Updates both the variable storing the current operator and the boolterm
   */
  set operatorValue(value: BoolOperator) {
    this.currentOperator = value;
    this.updateTerm();
  }

  /**
   * Getter for the data value of textTerm (for ngModel for input field).
   * @return {string}
   */
  get inputValue(): string {
    return this._value;
  }

  /**
   * Setter for the data value of textTerm (for ngModel for input field).
   *
   * @param {string} value
   */
  set inputValue(value: string) {
    this._value = value;
    this.updateTerm()
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
    this.term.attribute = this.currentAttributeObservable.getValue().featureName;
    this.term.operator = BoolAttribute.getOperatorName(this.currentOperator);
    this.term.values = this._value;
    this.boolTerm.update();
  }


  private attributeIsText(attr: BoolAttribute) {
    return attr.valueType.valueOf() == 2 || attr.valueType.valueOf() == 3;
  }

  /**
   * Be aware that you should not use the setters in this method, because they will call an update() which will destroy cached term-information
   */
  ngOnInit(): void {
    /* Check if we need to initialize the attribute */
    if (!this.term.attribute) {
      this.attribute = this.possibleAttributes.getValue()[0];
    } else {
      const match = this.possibleAttributes.getValue().find(attr => attr.featureName === this.term.attribute);
      if (match) {
        this.currentAttributeObservable.next(match);
      } else {
        console.error(`no matching attribute found for term ${this.term} in attribute list ${this.possibleAttributes.getValue()}`)
      }
    }
    if (this.term.operator) {
      this.currentOperator = BoolOperator[this.term.operator];
    } else {
      this.currentOperator = BoolAttribute.getDefaultOperatorsByValueType(this.attribute.valueType)[0];
    }
    if (this.term.values) {
      switch (this.attribute.valueType) {
        case ValueType.OPTIONS:
        case ValueType.DATE:
        case ValueType.NUMERIC:
        case ValueType.TEXT:
          this.inputValue = this.term.values;
          break;
        case ValueType.RANGE:
          //TODO
          console.error('TODO not implemented yet');
          this.inputValue = this.term.values;
          break;
      }
    }

  }
}
