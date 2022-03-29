import {Options} from '@angular-slider/ngx-slider';
import {BooleanQueryValueType} from '../../../shared/model/config/boolean-query-types';

export enum BoolOperator {
  EQ = '=',
  NEQ = '!=',
  LIKE = 'LIKE',
  ILIKE = 'ILIKE',
  NLIKE = 'NLIKE',
  RLIKE = 'RLIKE',
  ISNULL = 'ISNULL',
  ISNOTNULL = 'ISNOTNULL',
  GEQ = '≥',
  LEQ = '≤',
  GREATER = '>',
  LESS = '<',
  IN = 'IN',
  BETWEEN = 'BETWEEN',
}

export enum InputType {
  OPTIONS,
  DATE,
  NUMERIC,
  TEXT,
  RANGE,
  DYNAMICOPTIONS,
}

export class BoolAttribute {

  public readonly displayName: string;
  public readonly operators: BoolOperator[];
  public readonly inputType: InputType;
  public readonly options: any[];
  public readonly range: [number, number];
  public readonly sliderOptions: Options;
  public minValue: number;
  public maxValue: number;
  public readonly featureName: string;
  public readonly valueType?: BooleanQueryValueType;

  /**
   * Default Operators are available per ValueType
   * The Enum[value].valueOf() syntax is the best way to ensure that both the numeric index as well as the string get matched in the switch-case
   */
  public static getDefaultOperatorsByValueType(type: InputType): BoolOperator[] {
    let t = -1;
    if (typeof type == 'string') {
      t = Number(InputType[type])
    } else {
      t = type.valueOf()
    }
    switch (t) {
      case InputType.DATE:
        return [BoolOperator.EQ, BoolOperator.NEQ, BoolOperator.BETWEEN,
          BoolOperator.LEQ, BoolOperator.GEQ, BoolOperator.GREATER, BoolOperator.LESS];
      case InputType.NUMERIC:
        return [BoolOperator.NEQ, BoolOperator.EQ,
          BoolOperator.GEQ, BoolOperator.LEQ, BoolOperator.GREATER, BoolOperator.LESS];
      case InputType.OPTIONS:
      case InputType.DYNAMICOPTIONS:
        return [BoolOperator.EQ, BoolOperator.NEQ];
      case InputType.RANGE:
        return [BoolOperator.BETWEEN];
      case InputType.TEXT:
        return [BoolOperator.LIKE, BoolOperator.EQ];
      default:
        console.error('type ' + type + ' not known');
        return undefined;
    }
  }

  /**
   * Since typescript enums only have a reverse mapping for int-assignments, we have to do this manually...
   */
  public static getOperatorName(operator: BoolOperator) {
    switch (operator) {
      case BoolOperator.EQ:
        return 'EQ';
      case BoolOperator.NEQ:
        return 'NEQ';
      case BoolOperator.LIKE:
        return 'LIKE';
      case BoolOperator.ILIKE:
        return 'ILIKE';
      case BoolOperator.NLIKE:
        return 'NLIKE';
      case BoolOperator.RLIKE:
        return 'RLIKE';
      case BoolOperator.ISNULL:
        return 'ISNULL';
      case BoolOperator.ISNOTNULL:
        return 'ISNOTNULL';
      case BoolOperator.GEQ:
        return 'GEQ';
      case BoolOperator.LEQ:
        return 'LEQ';
      case BoolOperator.GREATER:
        return 'GREATER';
      case BoolOperator.LESS:
        return 'LESS';
      case BoolOperator.IN:
        return 'IN';
      case BoolOperator.BETWEEN:
        return 'BETWEEN';
    }
    console.error('Could not match operator ' + operator);
    return '';
  }

  private static parse(value: string, type?: BooleanQueryValueType): any {
    if(type){
      let t = -1;
      if (typeof type == 'string') {
        t = Number(BooleanQueryValueType[type])
      } else {
        t = type
      }
      switch (t.valueOf()) {
        case BooleanQueryValueType.number.valueOf():
          return Number(value)
        case BooleanQueryValueType.string.valueOf():
          return value
      }
    }
    return value
  }

  /**
   * @param displayName how the attribute should be displayed
   * @param featureName how the feature is named in cineast
   * @param operators if no operator is specified, operators are chosen based on the defaults provided per ValueType
   * @param inputType type of attribute, determines selection mechanism - e.g. range, text etc.
   * @param options for the Options ValueType, a list of strings can be provided which will be displayed in a dropdown
   * @param range for the Between ValueType, two numbers can be provided. A slider will enable to user to set the desired range.
   * @param type the type the input value should have (string / number)
   */
  constructor(displayName: string, featureName: string, inputType: InputType, operators?: BoolOperator[], options?: string[], range?: [number, number], type?: BooleanQueryValueType) {
    this.displayName = displayName;
    this.featureName = featureName;
    this.inputType = inputType;
    this.valueType = type
    if (operators) {
      this.operators = operators;
    } else {
      this.operators = BoolAttribute.getDefaultOperatorsByValueType(inputType)
    }
    if (options) {
      this.options = options.map(o => BoolAttribute.parse(o, this.valueType));
    }
    if (range) {
      this.range = range;
      this.sliderOptions = {
        floor: range[0],
        ceil: range[1],
        animate: false,
      };
      this.minValue = this.sliderOptions.floor;
      this.maxValue = this.sliderOptions.ceil;
    }
  }
}
