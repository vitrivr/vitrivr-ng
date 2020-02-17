import {QueryConfig} from '../interfaces/requests/query-config.interface';
import {QueryStage} from '../../queries/query-stage.model';

export class StagedSimilarityQuery {

  constructor(public readonly stages: QueryStage[], public readonly config: QueryConfig = null) {
  }
}
