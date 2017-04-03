import {Message} from "./message.interface";
import {MediaType} from "../../media/media-object.model";
import {QueryContainerInterface} from "../../queries/interfaces/query-container.interface";

/**
 * Basic interfaces of a QueryMessage.
 */
export interface QueryMessage extends Message {
    containers : QueryContainerInterface[];
    types: MediaType[]
}