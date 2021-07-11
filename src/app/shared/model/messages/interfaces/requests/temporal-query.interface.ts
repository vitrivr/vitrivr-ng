import {StagedSimilarityQuery} from '../../queries/staged-similarity-query.model';

export interface TemporalQueryMessage {
  queries: StagedSimilarityQuery[];
  timeDistances: number[];
  maxLength: number;
}
