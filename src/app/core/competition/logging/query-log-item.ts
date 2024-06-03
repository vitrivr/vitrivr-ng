import {ApiClientEvaluationInfo, ApiEvaluationState} from '../../../../../openapi/dres';

export interface QueryLogItem {
  query: any,
  dresTask: ApiEvaluationState,
  dresRun: ApiClientEvaluationInfo,
}
