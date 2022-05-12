import { QueryConfig } from '../../../../../../openapi/cineast';
import {QueryStage} from '../../queries/query-stage.model';

export class StagedSimilarityQuery {

  constructor(public readonly stages: QueryStage[], public readonly config: QueryConfig = null) {
  }
}
