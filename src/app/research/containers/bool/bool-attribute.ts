import {BoolTerm} from './individual/bool-term';
import {Options} from 'ng5-slider';

export class BoolAttribute {

    public readonly attribute: string;
    public readonly operators: BoolOperator[];
    public readonly valueType: ValueType;
    public readonly options: string[];
    public readonly range: [number, number];
    public readonly sliderOptions: Options;
    public minValue: number;
    public maxValue: number;

    constructor(attribute: string, operators: BoolOperator[], valueType: ValueType, options?: string[], range?: [number, number]) {
        this.attribute = attribute;
        this.operators = operators;
        this.valueType = valueType;
        if (options) {
            this.options = options;
        }
        if (range) {
            this.range = range;
            this.sliderOptions = {
                floor: range[0],
                ceil: range[1],
            }
            this.minValue = this.sliderOptions.floor;
            this.maxValue = this.sliderOptions.ceil;
        }
    }
}

export enum BoolOperator {
    EQ = '=',
    NEQ = '!=',
    LIKE = 'LIKE',
    BIGGER = '>',
    SMALLER = '<',
    BETWEEN = 'BETWEEN',
}

export enum ValueType {
    OPTIONS = 0,
    DATE = 1,
    NUMERIC = 2,
    TEXT = 3,
    RANGE = 4,
}
