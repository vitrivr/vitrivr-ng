import {StagedSimilarityQuery} from '../../queries/staged-similarity-query.model';

export interface TemporalQueryMessageV2 {
  queries: StagedSimilarityQuery[];
  timeDistances: number[];
  maxLength: number;
}
