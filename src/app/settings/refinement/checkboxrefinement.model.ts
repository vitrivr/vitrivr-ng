import {AbstractRefinementOption} from './refinementoption.model';
import {FilterType} from './filtertype.model';

export class CheckboxRefinementModel extends AbstractRefinementOption {
  constructor(public options: Set<string>) {
    super(FilterType.CHECKBOX)
  }

}
