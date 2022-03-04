import {Hint} from './query-config.interface';

export interface TemporalQueryConfig {
  queryId: string;
  hints: Hint[];
  timeDistances: number[];
  maxLength: number;
}