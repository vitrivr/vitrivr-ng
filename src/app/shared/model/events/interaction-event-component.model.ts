import {InteractionEventType} from "./interaction-event-type.model";

/** Context keys used to access context information. */
export type ContextKey =
        "f:type" /* Filter types used. */
    |   "f:value" /* Filter value used. */
    |   "q:categories" /* Query categories submitted with a query. */
    |   "q:value" /* Value  submitted with a query. */
    |   "i:mediaobject" /* The item that was interacted with (mediaobject). */
    |   "i:mediasegment" /* The item that was interacted with (mediasegment). */
    |   "w:weights" /* The categories and weights after a re-weighting action. */


/**
 * Represents a single InteractionEventComponent (i.e. a part of the InteractionEvent). It has a specific
 * InteractionEventType and optional context information.
 */
export class InteractionEventComponent {
    constructor(public readonly type: InteractionEventType, public readonly context: Map<ContextKey,any> = new Map()) {}
}