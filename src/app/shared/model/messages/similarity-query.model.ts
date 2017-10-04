import {MessageType} from "./message-type.model";
import {QueryContainerInterface} from "../queries/interfaces/query-container.interface";
import {SimilarityQueryMessage} from "./interfaces/similarity-query.interface";

export class SimilarityQuery implements SimilarityQueryMessage {
    public readonly messageType : MessageType = "Q_SIM";
    constructor(public readonly containers : QueryContainerInterface[]) {}

    /**
     * Returns a JSON object representing the current SimilarityQueryMessage
     * instance.
     */
    public toJson() : any {
        return {
            messageType: this.messageType,
            containers: this.containers.map(c => { return c.toJson() })
        }
    }
}
