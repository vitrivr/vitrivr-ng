import {EventType} from "./event-type.model";

export type ContextKey = "categories" | "value"
export class EventComponent {
    constructor(public readonly type: EventType, public readonly context?: Map<ContextKey,any>) {}
}