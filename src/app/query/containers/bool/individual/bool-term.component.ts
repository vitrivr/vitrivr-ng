import {ChangeDetectorRef, Component, Injectable, Input, OnInit} from '@angular/core';
import {BoolQueryTerm} from '../../../../shared/model/queries/bool-query-term.model';
import {BoolAttribute, BoolOperator, ValueType} from '../bool-attribute';
import {BehaviorSubject, Observable} from 'rxjs';
import {BoolTerm} from './bool-term';
import {BooleanService} from '../../../../core/queries/boolean.service';
import {filter, first} from 'rxjs/operators';
import {BooleanLookupQuery} from '../../../../shared/model/messages/queries/boolean-lookupquery.model';

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

  @Input() public boolLookupQueries: BooleanLookupQuery[];
  /** Current selection */
  public currentAttributeObservable: BehaviorSubject<BoolAttribute> =
    new BehaviorSubject<BoolAttribute>(new BoolAttribute('debug-attribute', 'features.debug', ValueType.TEXT));

  /** Current BoolTerm */
  @Input() public term: BoolTerm;
  /** If the new Model should be used */
  @Input() public newModel: boolean;

  /** Currently selected operator */
  currentOperator: BoolOperator;

  private _value: any[] = [];
    /** Container Weights of the extended Model */
  public weights: any[] = ['Strict', 'Preferred'];

 boolComponentID: number;

 private results: number;

 private totalResults: number;

 private _extendedModel: string;
 public data: any;

 constructor(private _boolService: BooleanService,
             private changeDet: ChangeDetectorRef) {

}

  get currentAttribute(): Observable<BoolAttribute> {
    return this.currentAttributeObservable;
  }

  get attribute(): BoolAttribute {
    return this.currentAttributeObservable.getValue();
  }

  set attribute(value: BoolAttribute) {
    this.currentAttributeObservable.next(value);
    this.currentOperator = value.operators[0];
      this.data = this.currentAttributeObservable.getValue().data;
    this._value = [];
    this.updateTerm();
  }

  /**
   * By default, the operator is set to equals since that is supported by all boolean types
   */
  get operatorValue(): BoolOperator {
    if (this.currentOperator === null) {
      return BoolOperator.EQ;
    }
    return this.currentOperator;
  }

  /**
   * Updates both the variable storing the current operator and the boolterm
   */
  set operatorValue(value: BoolOperator) {
    this.currentOperator = value;
    this.getResults();
    this.updateTerm();
  }

  /**
   * Getter for the data value of textTerm (for ngModel for input field).
   * @return {string}
   */
  get inputValue(): string {
    return this._value[0];
  }

  /**
   * Setter for the data value of textTerm (for ngModel for input field).
   *
   * @param {string} value
   */
  set inputValue(value: string) {
    this._value = [value];
    this.updateTerm();
  }




  get extendedModel(): string {
        return this._extendedModel;
  }
  set extendedModel(value: string) {
        this._extendedModel = value;
        this.updateRelevant();
  }


  private updateRangeValue() {
    this._value = [this.minValue, this.maxValue]
  }

  get maxValue(): number {
    return this.currentAttributeObservable.getValue().maxValue
  }

  set maxValue(value: number) {
    this.currentAttributeObservable.getValue().maxValue = value;
    this.updateRangeValue();
    this.updateTerm();
    this.getResults();
  }

  get minValue(): number {
    return this.currentAttributeObservable.getValue().minValue
  }

  set minValue(value: number) {
    this.currentAttributeObservable.getValue().minValue = value;
    this.updateRangeValue();
    this.updateTerm();
    this.getResults();
  }

  /**
   * Removes this term from the term container, causing all views and data to be updated
   */
  public onRemoveButtonClicked() {
    this.boolTerm.removeTerm(this.term);
    let ind = -1;
    this.boolLookupQueries.forEach((q, index) => {
          if (q.componentID === this.boolComponentID) {
              ind = index;
          }
      });
    if (ind !== -1) {
        this.boolLookupQueries.splice(ind, 1);
    }
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


  attributeIsText(attr: BoolAttribute) {
    return attr.valueType.valueOf() === 2 || attr.valueType.valueOf() === 3;
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
    switch (this.attribute.valueType) {
      case ValueType.OPTIONS:
      case ValueType.DYNAMICOPTIONS:
      case ValueType.DATE:
      case ValueType.NUMERIC:
      case ValueType.TEXT:
        if (this.term.values && this.term.values !== []) {
          this.inputValue = this.term.values[0];
        } else {
          this.inputValue = '';
        }
        break;
      case ValueType.RANGE:
        if (this.term.values && this.term.values !== []) {
          const min = this.term.values[0];
          const max = this.term.values[1];
          this.minValue = min;
          this.maxValue = max;
        } else {
          this.minValue = this.currentAttributeObservable.getValue().minValue;
          this.maxValue = this.currentAttributeObservable.getValue().maxValue;
        }
        break;
    }
    if (this.currentAttributeObservable.getValue().valueType === ValueType.RANGE) {
      this.updateRangeValue();
    }
    this.updateTerm();
      this._boolService._totalresults.subscribe(x => {this.totalResults = x;
          this.results = x;
          this.changeDet.detectChanges()
      });
    this._boolService._nmbofitems.pipe(filter(x => x.has(this.boolComponentID))).subscribe( x => {
        this.results = x.get(this.boolComponentID);
        this.changeDet.detectChanges();
    });
    this.boolComponentID = this._boolService.getComponentID();
      this.extendedModel = 'Strict';
      console.log(this.attribute.data)
  }

  isOption(): boolean {
    return this.attribute.valueType.valueOf() === 0 || this.attribute.valueType.valueOf() === 5;
  }

  public getResults(): void {
      let exists = false;
      this.boolLookupQueries.forEach((q, index) => {
          if (q.componentID === this.boolComponentID) {
              this.boolLookupQueries[index] = new BooleanLookupQuery(this.term.attribute.split('.')[0], this.term.attribute.split('.')[1], this._value,
                  BoolAttribute.getOperatorName(this.currentOperator), this.boolComponentID);
              exists = true;
          }
      });
      if (!exists) {
          this.boolLookupQueries.push(new BooleanLookupQuery(this.term.attribute.split('.')[0], this.term.attribute.split('.')[1],
              this._value, BoolAttribute.getOperatorName(this.currentOperator), this.boolComponentID));
      }
      this._boolService.findBool(this.boolLookupQueries, 'B_QUERY', this.boolComponentID);
      }
  private updateRelevant(): void {
      if (this._extendedModel !== 'Strict') {
          this.term.relevant = false;
      } else {
          this.term.relevant = true;
      }
      this.boolTerm.update();
  }
}
