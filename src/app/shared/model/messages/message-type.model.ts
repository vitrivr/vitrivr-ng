/**
 * Defines the different types of messages used in exchange with Cineast. This only concerns the WebSocket API!
 */
export type MessageType = "INIT" | "PING" | "Q_SIM" | "Q_MLT" | "QR_START" | "QR_END" |"QR_SIMILARITY" | "QR_OBJECT" | "QR_SEGMENT" | "QR_METADATA" | "M_LOOKUP";