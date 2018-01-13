import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {InteractionEvent} from "../../shared/model/events/event.model";

@Injectable()
export class EventBusService {
    /** The subject used to publish events to. */
    private _bus: Subject<InteractionEvent> = new Subject();

    /**
     * Publishes a nev InteractionEvent to the bus.
     *
     * @param {InteractionEvent} event
     */
    public publish(event: InteractionEvent) {
        this._bus.next(event);
    }

    /**
     * Returns an observable that allows a consumer to receive event updates.
     *
     * @return {Observable<InteractionEvent>}
     */
    public observable(): Observable<InteractionEvent> {
        return this._bus.asObservable();
    }
}