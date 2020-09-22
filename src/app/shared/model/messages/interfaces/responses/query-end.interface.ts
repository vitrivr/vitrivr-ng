import {Message} from '../message.interface';

/**
 * QueryEnd message.interface.ts: Sent by Cineast when a SimilarityQuery was processed completely. No new research-messages for
 * the same queryId should be received after this point..
 */
export interface QueryEnd extends Message {
  queryId: string;
}
