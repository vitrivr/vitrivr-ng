import {Message} from "../message.interface";
/**
 * QueryStart message.interface.ts: Sent by Cineast when a SimilarityQuery was received and processing starts. Every
 * processed research is associated with a unique queryId.
 */
export interface QueryStart extends Message {
    queryId : string;
}