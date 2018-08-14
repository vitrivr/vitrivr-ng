import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {Observable} from "rxjs";
import {InteractionEvent} from "../../shared/model/events/interaction-event.model";

/**
 * This is a simple application singleton used to emmit application wide events usually triggered by some sort of user-interaction. It
 * is up to the components to emmit the appropriate events. Other services or components within Vitrivr NG may register to those events
 * and act on them.
 */
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