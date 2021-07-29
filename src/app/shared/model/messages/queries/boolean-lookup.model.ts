import {QueryConfig} from '../interfaces/requests/query-config.interface';
import {MessageType} from '../message-type.model';
import {BooleanLookupInterface} from '../interfaces/requests/boolean-lookup.interface';
import {BoolOperator} from '../../../../query/containers/bool/bool-attribute';
import {BooleanLookupQuery} from './boolean-lookupquery.model';

export type BooleanLookupType =
    'B_ALL'|
    'B_QUERY';

export class BooleanLookup implements BooleanLookupInterface {
    public readonly messageType: MessageType = 'B_LOOKUP';

    constructor(public readonly config: QueryConfig = null, public readonly boolQueries: BooleanLookupQuery[],  public readonly type: string, public readonly componentID: number) {
    }

    public hasQuery(componentID: number): boolean {
        this.boolQueries.forEach( q => {
            if (q.componentID === componentID) {
                return true;
            }
        });
        return false;
    }
}

