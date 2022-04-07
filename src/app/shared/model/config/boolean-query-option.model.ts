import {BoolOperator, InputType} from '../../../query/containers/bool/bool-attribute';
import {BooleanQueryValueType} from './boolean-query-types';

export class BooleanQueryOption {

  public constructor(public readonly display: string, public readonly input: InputType, public readonly table: string, public readonly col: string, public readonly range?:[number, number], public readonly options?: any[], public readonly type?: BooleanQueryValueType, public readonly operators?: BoolOperator[]) {
  }

  public static getInputTypeValue(type: InputType): InputType {
    let t = -1;
    if (typeof type == 'string') {
      t = Number(InputType[type])
    } else {
      t = type.valueOf()
    }
    return t
  }

}