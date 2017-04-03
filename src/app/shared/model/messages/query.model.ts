import {MessageType} from "./message-type.model";
import {QueryContainerInterface} from "../queries/interfaces/query-container.interface";
import {MediaType} from "../media/media-object.model";
import {QueryMessage} from "./interfaces/query.interface";

export class Query implements QueryMessage {
    messagetype : MessageType = "Q_QUERY";
    containers : QueryContainerInterface[] = [];
    types : MediaType[] = [];
}