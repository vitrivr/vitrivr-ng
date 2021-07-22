import {QueryConfig} from '../interfaces/requests/query-config.interface';
import {MessageType} from '../message-type.model';
import {BooleanLookupInterface} from '../interfaces/requests/boolean-lookup.interface';

export class BooleanLookup implements BooleanLookupInterface {
    public readonly messageType: MessageType = 'B_LOOKUP';

    constructor(public readonly entity: string, public readonly config: QueryConfig = null, public readonly attribute: string, public readonly value: string) {
    }
}
