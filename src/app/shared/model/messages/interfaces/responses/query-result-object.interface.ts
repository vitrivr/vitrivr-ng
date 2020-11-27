import {QueryResult} from './query-result.interface';
import {MediaObject} from '../../../media/media-object.model';

export interface MediaObjectQueryResult extends QueryResult {
  content: MediaObject[],
}
