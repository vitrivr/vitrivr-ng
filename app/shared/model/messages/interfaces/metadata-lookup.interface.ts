import {Message} from "./message.interface";

/**
 * General interface of a MetadataLookupMessage
 */
export interface MetadataLookupMessage extends Message {
    objectids : string[],
    domains : string[]
}