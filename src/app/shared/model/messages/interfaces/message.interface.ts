/**
 * IMPORTANT: These interfaces define all the field of the different messages types used to communicate with Cineast. These
 * definitions must be in line with Cineast as the interfaces are used to map JSON responses to object-representations.
 *
 * @see Cineast: org.vitrivr.cineast.core.data.messages package.
 */

import {MessageType} from "../message-type.model";
/**
 * Basic interfaces of every message.interface.ts, which can be identified by its messageType field.
 */
export interface Message {
    messageType : MessageType
}
