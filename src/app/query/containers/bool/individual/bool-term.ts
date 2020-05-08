/**
 * Simplest possible representation of a boolean term. Loosely translates to SELECT * FROM entity WHERE attribute operator values
 *
 * Two simple examples: WHERE attribute IN (value_1, value_2, ...), WHERE attribute LIKE text
 */
export class BoolTerm {
  /* name of the corresponding feature */
  public attribute: string;
  public operator: string;
  private _values: string;

  constructor(attribute: string, operator: string, value: string) {
    this.attribute = attribute;
    this.operator = operator;
    this._values = value;
  }

  get values() {
    return this._values;
  }

  set values(values: string) {
    this._values = values;
  }
}
