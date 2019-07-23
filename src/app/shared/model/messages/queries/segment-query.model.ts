import {MessageType} from "../message-type.model";
import {QueryConfig} from "../interfaces/requests/query-config.interface";
import {SegmentQueryMessage} from "../interfaces/requests/segment.query.interface";

export class SegmentQuery implements SegmentQueryMessage {
    public readonly messageType: MessageType = "Q_SEG";
    constructor(public readonly segmentId: string, public readonly config: QueryConfig) {}
}