import {Query} from './query-query.interface';

export interface SkelLookupMessage extends Query {
  /** The image to get a skeleton from. */
  img: string;
}
