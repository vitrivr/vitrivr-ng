import {StatusType} from '../messages/interfaces/responses/ping.interface';

export class ApiStatus {
  constructor(public readonly timestamp: number, public readonly status: StatusType, public readonly latency: number) {
  }
}
