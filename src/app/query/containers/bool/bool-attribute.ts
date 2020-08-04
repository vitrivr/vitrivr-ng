import {Options} from 'ng5-slider';

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

export enum ValueType {
  OPTIONS = 0,
  DATE = 1,
  NUMERIC = 2,
  TEXT = 3,
  RANGE = 4,
  DYNAMICOPTIONS = 5,
}

export class BoolAttribute {

  public readonly displayName: string;
  public readonly operators: BoolOperator[];
  public readonly valueType: ValueType;
  public readonly _options: string[];
  public readonly range: [number, number];
  public readonly sliderOptions: Options;
  public minValue: number;
  public maxValue: number;
  public readonly featureName: string;

  public get options(): string[] {
    return this._options;
  }

  /**
   * @param displayName how the attribute should be displayed
   * @param featureName how the feature is named in cineast
   * @param operators if no operator is specified, operators are chosen based on the defaults provided per ValueType
   * @param valueType type of attribute
   * @param options for the Options ValueType, a list of strings can be provided which will be displayed in a dropdown
   * @param range for the Between ValueType, two numbers can be provided. A slider will enable to user to set the desired range.
   */
  constructor(displayName: string, featureName: string, valueType: ValueType, operators?: BoolOperator[], options?: string[], range?: [number, number]) {
    this.displayName = displayName;
    this.featureName = featureName;
    this.valueType = valueType;
    if (operators) {
      this.operators = operators;
    } else {
      this.operators = BoolAttribute.getDefaultOperatorsByValueType(valueType)
    }
    if (options) {
      this._options = options;
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

  /**
   * Default Operators are available per ValueType
   */
  public static getDefaultOperatorsByValueType(type: ValueType): BoolOperator[] {
    switch (type) {
      case ValueType.DATE:
        return [BoolOperator.EQ, BoolOperator.NEQ, BoolOperator.BETWEEN,
          BoolOperator.LEQ, BoolOperator.GEQ, BoolOperator.GREATER, BoolOperator.LESS];
      case ValueType.NUMERIC:
        return [BoolOperator.NEQ, BoolOperator.EQ,
          BoolOperator.GEQ, BoolOperator.LEQ, BoolOperator.GREATER, BoolOperator.LESS];
      case ValueType.OPTIONS:
      case ValueType.DYNAMICOPTIONS:
        return [BoolOperator.EQ, BoolOperator.NEQ];
      case ValueType.RANGE:
        return [BoolOperator.BETWEEN];
      case ValueType.TEXT:
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
}
