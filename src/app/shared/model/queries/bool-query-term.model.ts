import {AbstractQueryTerm} from './abstract-query-term.model';
import {BoolTerm} from '../../../query/containers/bool/individual/bool-term';

export class BoolQueryTerm extends AbstractQueryTerm {

    public readonly terms: BoolTerm[] = [];

    constructor() {
        super('BOOLEAN', ['boolean']);
    }
}
