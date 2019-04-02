export class BoolAttribute {

    public readonly attribute: string;
    public readonly operators: BoolOperator[];
    public readonly valueType: ValueType;
    public readonly options: string[];

    constructor(attribute: string, operators: BoolOperator[], valueType: ValueType, options?: string[]) {
        this.attribute = attribute;
        this.operators = operators;
        this.valueType = valueType;
        if (options) {
            this.options = options;
        }
    }
    // TODO Add logic for input storage
}

export enum BoolOperator {
    EQ = '=',
    NEQ = '!=',
    LIKE = 'LIKE',
    BIGGER = '>',
    SMALLER = '<',
}

export enum ValueType {
    OPTIONS = 0,
    DATE = 1,
    NUMERIC = 2,
    TEXT = 3,
}
