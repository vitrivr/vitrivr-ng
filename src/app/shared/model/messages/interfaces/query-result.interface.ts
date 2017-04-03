import {Message} from "./message.interface";

/**
 * QueryResult message.interface.ts: Defines the general structure of a QueryResult.
 */
export interface QueryResult extends Message {
    content : any[],
    count : number
    queryId : string;
}