import {ClientRunInfo, ClientTaskInfo} from '../../../../../openapi/dres';

export interface QueryLogItem {
  query: any,
  dresTask: ClientTaskInfo,
  dresRun: ClientRunInfo,
}
