import {StagedSimilarityQuery} from '../../queries/staged-similarity-query.model';
import {MetadataAccessSpecification} from '../../queries/metadata-access-specification.model';

export interface TemporalQueryMessage {
  queries: StagedSimilarityQuery[];
  timeDistances: number[];
  maxLength: number;
  metadataAccessSpec: MetadataAccessSpecification[];
}
