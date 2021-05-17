import {QueryResult} from './query-result.interface';
import {FeatureCategories} from '../../../results/feature-categories.model';
import {StringDoublePair} from '../../../../../../../openapi/cineast';

/**
 * QueryResult message.interface.ts: Defines the general structure of a QueryResult.
 */
export interface SimilarityQueryResult extends QueryResult {
  category: FeatureCategories;
  content: StringDoublePair[];
  containerId?: number;
}
