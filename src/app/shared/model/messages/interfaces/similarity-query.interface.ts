import {Message} from "./message.interface";
import {QueryContainerInterface} from "../../queries/interfaces/query-container.interface";

/**
 * Basic interfaces of a SimilarityQueryMessage.
 */
export interface SimilarityQueryMessage extends Message {
    containers : QueryContainerInterface[];
}