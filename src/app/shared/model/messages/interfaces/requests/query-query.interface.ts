import {Message} from "../message.interface";
import {QueryConfig} from "./query-config.interface";

/**
 * General interface for a query message. The different types of query messages should inherit from this interface.
 */
export interface Query extends Message {
    /** The QueryConfig object that should be used to configure the query. May be null! */
    config: QueryConfig;
}