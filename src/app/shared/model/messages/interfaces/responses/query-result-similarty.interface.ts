import {Similarity} from '../../../media/similarity.model';
import {QueryResult} from './query-result.interface';
import {FeatureCategories} from '../../../results/feature-categories.model';

/**
 * QueryResult message.interface.ts: Defines the general structure of a QueryResult.
 */
export interface SimilarityQueryResult extends QueryResult {
  category: FeatureCategories;
  content: Similarity[];
  containerId?: number;
}
