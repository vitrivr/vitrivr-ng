import {Message} from '../message.interface';
import {QueryContainerInterface} from '../../../queries/interfaces/query-container.interface';

/**
 * Basic interfaces of a SimilarityQueryMessage. Upon reception, Cineast will execute a similarity query based on the
 * provided StagedQueryContainer.
 */
export interface SimilarityQueryMessage extends Message {
  containers: QueryContainerInterface[]
}
