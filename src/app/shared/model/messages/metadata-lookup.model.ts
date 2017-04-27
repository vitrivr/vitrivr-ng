import {MessageType} from "./message-type.model";
import {MetadataLookupMessage} from "./interfaces/metadata-lookup.interface";

export class MetadataLookup implements MetadataLookupMessage {
    readonly messagetype : MessageType = "M_LOOKUP";

    /** Object IDs for which to lookup metadata. */
    readonly objectids : string[] = [];

    /** Domains to include in the lookup. If empty, all domains will be considered.
     *
     * (Not supported yet as of 2017-02-13)
     *
     * @type {Array}
     */
    readonly domains : string[] = [];

    /**
     *
     * @param objectids
     */
    constructor(...objectids: string[]) {
        this.objectids = objectids;
    }
}