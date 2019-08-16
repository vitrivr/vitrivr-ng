import {AbstractRefinementOption} from './refinementoption.model';
import {FilterType} from './filtertype.model';

export class SliderRefinementModel extends AbstractRefinementOption {

    constructor(public min: number, public max: number) {
        super(FilterType.SLIDER)
    }

    sliderOptions() {
        return {
            floor: this.min,
            ceil: this.max
        }
    }

}
