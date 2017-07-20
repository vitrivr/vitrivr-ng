import {MoreLikeThisQueryMessage} from "./interfaces/more-like-this-query.interface";
import {MessageType} from "./message-type.model";

export class MoreLikeThisQuery implements MoreLikeThisQueryMessage {
    public readonly messageType: MessageType = "Q_MLT";
    public constructor(public readonly segmentId: string, public readonly categories: string[]) {}
}
