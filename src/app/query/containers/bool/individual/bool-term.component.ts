import {Component, Injectable, Input, OnInit} from '@angular/core';
import {BoolQueryTerm} from '../../../../shared/model/queries/bool-query-term.model';
import {BoolAttribute, BoolOperator, ValueType} from '../bool-attribute';
import {BehaviorSubject, Observable} from 'rxjs/Rx';
import {BoolTerm} from './bool-term';
import {Base64Util} from '../../../../shared/util/base64.util';

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
  public boolTerm: BoolQueryTerm;

  @Input()
  public readonly containers: BoolTermComponent[];

  @Input()
  public readonly self: BoolTermComponent;

  @Input()
  public readonly possibleAttributes: BehaviorSubject<BoolAttribute[]>;
  /** Current selection */
  public currentAttributeObservable: BehaviorSubject<BoolAttribute> =
    new BehaviorSubject<BoolAttribute>(new BoolAttribute('debug-attribute', 'features.debug', ValueType.TEXT));
  /** Current BoolTerm */
  public term: BoolTerm;
  /** Currently selected operator */
  currentOperator: BoolOperator;

  // TODO Currently slider values are not stored anywhere

  get currentAttribute(): Observable<BoolAttribute> {
    return this.currentAttributeObservable;
  }

  get attribute(): BoolAttribute {
    return this.currentAttributeObservable.getValue();
  }

  set attribute(value: BoolAttribute) {
    this.currentAttributeObservable.next(value);
    this.currentOperator = value.operators[0];
    this.updateTerms();
  }

  get operatorValue(): BoolOperator {
    if (this.currentOperator == null) {
      return BoolOperator.EQ;
    }
    return this.currentOperator;
  }

  set operatorValue(value: BoolOperator) {
    this.currentOperator = value;
    this.updateTerms();
  }

  /**
   * Getter for the data value of textTerm (for ngModel for input field).
   * @return {string}
   */
  get inputValue(): string {
    if (this.term == null) {
      return '';
    }
    return this.term.values;
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

  public removeTermFromData() {
    const termIdx = this.boolTerm.terms.indexOf(this.term);
    if (termIdx > -1) {
      console.log('found query term to remove at index ' + termIdx + ', removing');
      this.boolTerm.terms.splice(termIdx, 1);
      this.updateData();
    }
  }

  public updateData() {
    console.log('current terms: ' + JSON.stringify(this.boolTerm.terms));
    this.boolTerm.data = 'data:application/json;base64,' + Base64Util.strToBase64(JSON.stringify(this.boolTerm.terms));
  }

  /**
   * @param value input value for the term (e.g. 150 or 'basel')
   */
  public addTermToData(value?: string) {
    this.term = new BoolTerm(this.currentAttributeObservable.getValue().featureName,
      BoolAttribute.getOperatorName(this.currentOperator),
      value == null ? (this.term == null ? '' : this.term.values) : value);
    console.log('Adding new term: ' + JSON.stringify(this.term));
    this.boolTerm.terms.push(this.term);
    this.updateData()
  }

  public updateTerms(value?: string) {
    if (this.term != null) {
      this.removeTermFromData();
    }
    this.addTermToData(value);
  }

  ngOnInit(): void {
    this.attribute = this.possibleAttributes.getValue()[0];
  }
}
