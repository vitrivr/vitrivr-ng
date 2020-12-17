import {StagedSimilarityQuery} from '../../queries/staged-similarity-query.model';

export interface TemporalQueryMessage {
  queries: StagedSimilarityQuery[]
}
