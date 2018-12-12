import {AtomicEvent} from './atomic-event.model';
import {SubmittedEvent} from './event.model';

export interface CompositEvent extends SubmittedEvent {
    actions: AtomicEvent[];
}
