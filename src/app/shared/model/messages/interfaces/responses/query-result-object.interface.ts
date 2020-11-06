import { MediaObjectDescriptor } from 'app/core/openapi';
import {QueryResult} from './query-result.interface';

/**
 *
 */
export interface ObjectQueryResult extends QueryResult {
  content: MediaObjectDescriptor[],
}
