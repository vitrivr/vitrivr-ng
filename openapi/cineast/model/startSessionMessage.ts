/**
 * Cineast RESTful API
 * Cineast is vitrivr\'s content-based multimedia retrieval engine. This is it\'s RESTful API.
 *
 * The version of the OpenAPI document: v1
 * Contact: contact@vitrivr.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { Credentials } from './credentials';


export interface StartSessionMessage { 
    credentials?: Credentials;
    messageType?: StartSessionMessage.MessageTypeEnum;
}
export namespace StartSessionMessage {
    export type MessageTypeEnum = 'PING' | 'Q_SIM' | 'Q_MLT' | 'Q_NESEG' | 'Q_SEG' | 'M_LOOKUP' | 'Q_TEMPORAL' | 'B_LOOKUP' | 'SESSION_START' | 'QR_START' | 'QR_END' | 'QR_ERROR' | 'QR_OBJECT' | 'QR_METADATA_O' | 'QR_METADATA_S' | 'QR_SEGMENT' | 'QR_SIMILARITY' | 'QR_TEMPORAL' | 'QR_BOOL';
    export const MessageTypeEnum = {
        PING: 'PING' as MessageTypeEnum,
        QSIM: 'Q_SIM' as MessageTypeEnum,
        QMLT: 'Q_MLT' as MessageTypeEnum,
        QNESEG: 'Q_NESEG' as MessageTypeEnum,
        QSEG: 'Q_SEG' as MessageTypeEnum,
        MLOOKUP: 'M_LOOKUP' as MessageTypeEnum,
        QTEMPORAL: 'Q_TEMPORAL' as MessageTypeEnum,
        BLOOKUP: 'B_LOOKUP' as MessageTypeEnum,
        SESSIONSTART: 'SESSION_START' as MessageTypeEnum,
        QRSTART: 'QR_START' as MessageTypeEnum,
        QREND: 'QR_END' as MessageTypeEnum,
        QRERROR: 'QR_ERROR' as MessageTypeEnum,
        QROBJECT: 'QR_OBJECT' as MessageTypeEnum,
        QRMETADATAO: 'QR_METADATA_O' as MessageTypeEnum,
        QRMETADATAS: 'QR_METADATA_S' as MessageTypeEnum,
        QRSEGMENT: 'QR_SEGMENT' as MessageTypeEnum,
        QRSIMILARITY: 'QR_SIMILARITY' as MessageTypeEnum,
        QRTEMPORAL: 'QR_TEMPORAL' as MessageTypeEnum,
        QRBOOL: 'QR_BOOL' as MessageTypeEnum
    };
}


