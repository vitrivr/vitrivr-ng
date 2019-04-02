import {AbstractQueryTerm} from './abstract-query-term.model';
import {BoolTerm} from '../../../research/containers/bool/individual/bool-term';

export class BoolQueryTerm extends AbstractQueryTerm {

    public readonly terms: BoolTerm[] = [];

    data = this.terms.toString();   // TODO
    constructor() {
        super('BOOL', []);
    }
}
