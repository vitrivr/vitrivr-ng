export class BoolTerm {
  public readonly attribute: string;
  public readonly operator: string;
  public readonly values: string;

  constructor(attribute: string, operator: string, value: string) {
    this.attribute = attribute;
    this.operator = operator;
    this.values = value;
  }
}
