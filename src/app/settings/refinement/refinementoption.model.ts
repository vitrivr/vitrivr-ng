import {FilterType} from './filtertype.model';

export abstract class AbstractRefinementOption {
    protected constructor(public type: FilterType) {
    }
}

