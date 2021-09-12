import {Message} from '../message.interface';
import {MediaObjectMetadataDescriptor} from '../../../../../../../openapi/cineast';

/**
 * Defines the general structure of a BoolLookupQueryResult.
 */
export interface BoolLookupMessage extends Message {

    /* QueryID string */
    queryId: string,

    /* Number of entries in the result. */
    numberofElements: number

    /*To which component the Query belongs*/
    componentID: number
}
