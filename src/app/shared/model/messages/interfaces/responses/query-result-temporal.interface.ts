import {QueryResult} from './query-result.interface';
import {FeatureCategories} from '../../../results/feature-categories.model';
import {TemporalObject} from '../../../misc/temporalObject';

/**
 * QueryResult message.interface.ts: Defines the general structure of a QueryResult.
 */
export interface TemporalQueryResult extends QueryResult {
  content: TemporalObject[];
}
