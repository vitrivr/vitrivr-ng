import {TemporalQueryConfig} from '../interfaces/requests/temporal-query-config.interface';

export class ReadableTemporalQueryConfig implements TemporalQueryConfig {

  constructor(public readonly queryId: string = null, public readonly hints: [] = [], public readonly timeDistances: number[] = [], public readonly maxLength: number = -1) {
  }
}
