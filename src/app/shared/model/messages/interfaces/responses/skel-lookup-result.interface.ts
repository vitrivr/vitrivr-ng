import {QueryResult} from './query-result.interface';
import {PoseKeypoints} from '../../../pose/pose-keypoints.model';

/**
 * Defines the general structure of a MetadataQueryResult.
 */
export interface SkelLookupResult extends QueryResult {

  /* List of PoseKeypoints entries (may be empty). */
  content: PoseKeypoints[],
}
