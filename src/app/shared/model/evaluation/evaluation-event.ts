export type EventType = "STARTED" | "ENDED" | "FEATURE_AVAILABLE";
export class EvaluationEvent {
    constructor(public readonly time: Date, public readonly type: EventType, public readonly queryId : string, public readonly context: string) {}
}