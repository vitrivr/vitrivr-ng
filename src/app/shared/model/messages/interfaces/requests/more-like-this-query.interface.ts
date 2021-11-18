import {Query} from './query-query.interface';
import {MetadataAccessSpecification} from '../../queries/metadata-access-specification.model';

/**
 * Basic interfaces of a MoreLikeThisQueryMessage. Upon reception, Cineast will execute a More-Like-This query.
 */
export interface MoreLikeThisQueryMessage extends Query {
  /** ID of the segment which should be taken as reference for the query. */
  segmentId: string;

  /** List of the query categories that should be used for the query. Must not be null but may be empty! */
  categories: string[];

  metadataAccessSpec: MetadataAccessSpecification[];

}
