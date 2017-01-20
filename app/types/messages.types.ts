/**
 * IMPORTANT: These interfaces define all the field of the different messages types used to communicate with Cineast. These
 * definitions must be in line with Cineast as the interfaces are used to map JSON responses to object-representations.
 *
 * @see Cineast: org.vitrivr.cineast.core.data.messages package.
 */

/**
 *
 */
import {MediaObject, MediaSegment, Similarity, MediaType} from "./media.types";
import {QueryContainerInterface} from "./query.types";

/**
 * Defines the different types of messages used in exchange with Cineast
 */
export type MessageType = "INIT" | "PING" | "Q_QUERY" | "QR_START" | "QR_END" |"QR_SIMILARITY" | "QR_OBJECT" | "QR_SEGMENT";



/**
 * Basic interface of every Message, which can be identified by its messagetype field.
 */
export interface Message {
    messagetype : MessageType
}

/*
 * Interface that defines a PING message used to query the status
 * of the API. The same message is used in both directions.
 */
export type StatusType = "OK" | "ERROR" | "DISCONNECTED"
export interface Ping extends Message {
    status : StatusType
}

/**
 * Basic interface of a QueryMessage.
 */
export interface QueryMessage extends Message {
    containers : QueryContainerInterface[];
    types: MediaType[]
}


/**
 * QueryStart Message: Sent by Cineast when a Query was received and processing starts. Every
 * processed query is associated with a unique queryId.
 */
export interface QueryStart extends Message {
   queryId : string;
}

/**
 * QueryEnd Message: Sent by Cineast when a Query was processed completely. No new query-messages for
 * the same queryId should be received after this point..
 */
export interface QueryEnd extends Message {
    queryId : string;
}

/**
 * QueryResult Message: Defines the general structure of a QueryResult.
 */
export interface QueryResult extends Message {
    content : any[],
    count : number
    queryId : string;
}

/**
 * QueryResult Message: Defines the general structure of a QueryResult.
 */
export interface SimilarityQueryResult extends QueryResult {
    category : string;
    content : Similarity[],
}

/**
 *
 */
export interface ObjectQueryResult extends QueryResult {
    content : MediaObject[],
}

/**
 *
 */
export interface SegmentQueryResult extends QueryResult {
    content : MediaSegment[],
}


