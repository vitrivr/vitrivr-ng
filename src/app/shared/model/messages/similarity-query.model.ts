import {MessageType} from "./message-type.model";
import {QueryContainerInterface} from "../queries/interfaces/query-container.interface";
import {SimilarityQueryMessage} from "./interfaces/similarity-query.interface";

export class SimilarityQuery implements SimilarityQueryMessage {
    public readonly messagetype : MessageType = "Q_SIM";
    constructor(public readonly containers : QueryContainerInterface[]) {}
}