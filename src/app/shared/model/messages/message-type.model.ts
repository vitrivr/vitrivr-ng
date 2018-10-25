/**
 * Defines the different types of messages used in exchange with Cineast. This only concerns the WebSocket API!
 */
export type MessageType = "INIT" | "PING" | "Q_SIM" | "Q_MLT" | "Q_NESEG" | "QR_START" | "QR_END" | "QR_ERROR" |"QR_SIMILARITY" | "QR_OBJECT" | "QR_SEGMENT" | "QR_METADATA_OBJ" |  "QR_METADATA_SEG" | "M_LOOKUP";