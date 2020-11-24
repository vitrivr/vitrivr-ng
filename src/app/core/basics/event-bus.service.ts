import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {InteractionEvent} from '../../shared/model/events/interaction-event.model';
import {InteractionEventType} from '../../shared/model/events/interaction-event-type.model';

/**
 * This is a simple application singleton used to emmit application wide events usually triggered by some sort of user-interaction. It
 * is up to the components to emmit the appropriate events. Other services or components within Vitrivr NG may register to those events
 * and act on them.
 */
@Injectable()
export class EventBusService {
  /** The subject used to publish events to. */
  private _bus: Subject<InteractionEvent> = new Subject();

  /** The subject used to track the currently active view. */
  private _currentView: Subject<string> = new BehaviorSubject<string>(null);

  /**
   * Publishes a nev InteractionEvent to the bus.
   *
   * @param {InteractionEvent} event
   */
  public publish(event: InteractionEvent) {
    this._bus.next(event);
    if (event.components[0] && event.components[0].type === InteractionEventType.NAVIGATE) {
      this._currentView.next(event.components[0].context.get('n:component'));
    }
  }

  /**
   * Returns an observable that allows a consumer to be informed about view changes.
   *
   * @return {Observable<InteractionEvent>}
   */
  public currentView(): Observable<string> {
    return this._currentView.asObservable()
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
