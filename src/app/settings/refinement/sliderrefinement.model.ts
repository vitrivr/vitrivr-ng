import {AbstractRefinementOption} from './refinementoption.model';
import {FilterType} from './filtertype.model';
import {Options} from '@angular-slider/ngx-slider';

export class SliderRefinementModel extends AbstractRefinementOption {

  constructor(private _min: number, private _max: number) {
    super(FilterType.SLIDER)
  }

  set min(min: number) {
    this._min = min;
  }

  get min(): number {
    return this._min
  }

  set max(max: number) {
    this._max = max;
  }

  get max(): number {
    return this._max;
  }

  sliderOptions(): Options {
    return {
      floor: this.min,
      ceil: this.max
    }
  }

}
