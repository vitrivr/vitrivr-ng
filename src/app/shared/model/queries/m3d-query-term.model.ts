import {AbstractQueryTerm} from './abstract-query-term.model';

export class M3DQueryTerm extends AbstractQueryTerm {
  sliderSetting: number;

  constructor() {
    super('MODEL3D', ['sphericalharmonicsdefault'])
  }
}
