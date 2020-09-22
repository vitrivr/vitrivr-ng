import {Message} from '../message.interface';

/**
 * QueryError message.interface.ts: Sent by Cineast when an error occured while processing a SimilarityQuery. No new query-messages for
 * the same queryId should be received after this point.
 */
export interface QueryError extends Message {
  readonly queryId: string;
  readonly message: string;
}
