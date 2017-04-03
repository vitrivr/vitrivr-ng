/**
 * Defines the different types of messages used in exchange with Cineast
 */
export type MessageType = "INIT" | "PING" | "Q_QUERY" | "QR_START" | "QR_END" |"QR_SIMILARITY" | "QR_OBJECT" | "QR_SEGMENT" | "QR_METADATA" | "M_LOOKUP";