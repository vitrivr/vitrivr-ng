import {EventComponent} from "./event-component.model";

export class InteractionEvent {
    /** A list of event components.*/
    private _components: EventComponent[] = [];

    /** The time at which the event occurred. */
    private _timestamp = Date.now();

    /**
     * Constructor for InteractionEvent
     *
     * @param {EventComponent} components List of event components that constitute this event.
     */
    constructor(...components: EventComponent[]) {
        components.forEach(c => this._components.push(c));
    }

    /**
     * Getter for the list of event components.
     *
     * @return {EventComponent[]}
     */
    get components() {
        return this._components;
    }

    /**
     * Getter for the list of event components.
     *
     * @return {EventComponent[]}
     */
    get timestamp() {
        return this._timestamp;
    }
}