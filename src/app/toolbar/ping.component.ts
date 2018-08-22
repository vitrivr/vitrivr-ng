
import {Component} from '@angular/core';
import {map} from "rxjs/operators";
import {Observable, Subscription} from "rxjs";
import {PingService} from "../core/queries/ping.service";

@Component({
    selector: 'api-status',
    template:`
        <span >
            <mat-icon style="vertical-align:text-bottom;">{{icon | async}}</mat-icon>&nbsp;{{(latency | async) < 100000 ? '(' + (latency | async) + 'ms)' : "(&#x221e;)"}}
        </span>
    `
})

export class PingComponent {
    /**
     * Default constructor. Subscribe for PING messages at the CineastWebSocketFactoryService.
     *
     * @param _ping
     */
    constructor(private _ping : PingService) {}

    /**
     * Returns the icon name based on the current API status.
     *
     * @returns {any}
     */
    get icon() : Observable<string> {
        return this._ping.asObservable().pipe(
            map(s => {
                switch (s.status) {
                    case 'DISCONNECTED':
                        return 'flash_off';
                    case 'ERROR':
                        return 'error';
                    case 'OK':
                        return 'check_circle';
                    default:
                        return 'watch_later'
                }
            })
        )
    }

    /**
     * Getter for latency.
     *
     * @returns {number}
     */
    get latency() {
        return this._ping.asObservable().pipe(
            map(s => s.latency)
        )
    }
}
