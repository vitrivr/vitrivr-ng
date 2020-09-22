import {InteractionEventComponent} from './interaction-event-component.model';

/**
 * Represents a single InteractionEvent that took place at a specific point in time. It has a timestamp and may be
 * composed of multiple InteractionEventComponents.
 */
export class InteractionEvent {
  /** A list of event InteractionEventComponents.*/
  private readonly _components: InteractionEventComponent[] = [];

  /** The time at which the event occurred. */
  private readonly _timestamp = Date.now();

  /**
   * Constructor for InteractionEvent
   *
   * @param {InteractionEventComponent} components List of event components that constitute this event.
   */
  constructor(...components: InteractionEventComponent[]) {
    components.forEach(c => this._components.push(c));
  }

  /**
   * Getter for the list of event components.
   *
   * @return {InteractionEventComponent[]}
   */
  get components() {
    return this._components;
  }

  /**
   * Getter for the list of event components.
   *
   * @return {InteractionEventComponent[]}
   */
  get timestamp() {
    return this._timestamp;
  }
}
