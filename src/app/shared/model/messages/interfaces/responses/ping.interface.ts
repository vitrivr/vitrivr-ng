import {Message} from "../message.interface";

/*
 * Interface that defines a PING message used to query the status
 * of the API. The same message is used in both directions.
 */
export type StatusType = "OK" | "ERROR" | "DISCONNECTED"
export interface Ping extends Message {
    status : StatusType
}