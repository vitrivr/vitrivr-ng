import {MessageType} from "./message-type.model";
import {MetadataLookupMessage} from "./interfaces/metadata-lookup.interface";

export class MetadataLookup implements MetadataLookupMessage {
    messagetype : MessageType = "M_LOOKUP";

    /** Object IDs for which to lookup metadata. */
    objectids : string[] = [];

    /** Domains to include in the lookup. If empty, all domains will be considered.
     *
     * (Not supported yet as of 2017-02-13)
     *
     * @type {Array}
     */
    domains : string[] = [];

    /**
     *
     * @param objectids
     */
    constructor(...objectids: string[]) {
        this.objectids = objectids;
    }
}