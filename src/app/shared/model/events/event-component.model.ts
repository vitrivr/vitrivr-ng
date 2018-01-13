import {EventType} from "./event-type.model";

export class EventComponent {
    constructor(public readonly type: EventType, public readonly context?: string) {
    }
}