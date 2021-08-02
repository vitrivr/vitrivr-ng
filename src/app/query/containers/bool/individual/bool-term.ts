/**
 * Simplest possible representation of a boolean term. Loosely translates to SELECT * FROM entity WHERE attribute operator values
 *
 * Two simple examples: WHERE attribute IN (value_1, value_2, ...), WHERE attribute LIKE text
 */
export class BoolTerm {
  /* name of the corresponding feature */
  public attribute: string;
  public operator: string;
  public values: any[];
  public relevant: boolean;

  constructor(attribute: string, operator: string, value: any[], relevant: boolean) {
    this.attribute = attribute;
    this.operator = operator;
    this.values = value;
    this.relevant = relevant;
  }
}
