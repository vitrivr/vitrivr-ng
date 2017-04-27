import {Message} from "./message.interface";

/**
 * Basic interfaces of a MoreLikeThisQueryMessage.
 */
export interface MoreLikeThisQueryMessage extends Message {
    segmentId : string;
    categories : string[];
}