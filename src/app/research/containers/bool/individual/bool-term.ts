import {BoolOperator} from '../bool-attribute';

export class BoolTerm {
    public readonly attribute: string;
    public readonly operator: BoolOperator;
    public readonly value: string;

    constructor(attribute: string, operator: BoolOperator, value: string) {
        this.attribute = attribute;
        this.operator = operator;
        this.value = value;
    }
}
