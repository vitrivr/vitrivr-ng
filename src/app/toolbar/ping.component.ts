
import {Component} from '@angular/core';
import {map} from "rxjs/operators";
import {Observable, Subscription} from "rxjs";
import {PingService} from "../core/basics/ping.service";
import {CollabordinatorService} from "../core/vbs/collabordinator.service";
import {WebSocketFactoryService} from "../core/api/web-socket-factory.service";

@Component({
    selector: 'api-status',
    template:`
        <span>
            <button mat-button [matMenuTriggerFor]="appMenu">
                 <mat-icon>{{icon | async}}</mat-icon>&nbsp;{{(latency | async) < 100000 ? '(' + (latency | async) + 'ms)' : "(&#x221e;)"}}
            </button>
            <mat-menu #appMenu="matMenu">
                <button (click)="reconnectCineast()" mat-menu-item>Reconnect to Cineast</button>
                <mat-divider *ngIf="collabordinatorAvailable"></mat-divider>
                <button mat-menu-item (click)="reconnectCollabordinator()">Reconnect to Collabordinator</button>
            </mat-menu>
        </span>
    `
})

export class PingComponent {
    /**
     * Default constructor. Subscribe for PING messages at the CineastWebSocketFactoryService.
     *
     * @param _ping
     * @param _collabordinator CollabordinatorService reference.
     * @param _factory WebSocketFactoryService reference.
     */
    constructor(private _ping : PingService, private _collabordinator: CollabordinatorService, private _factory: WebSocketFactoryService) {}

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
     * Tries to re-connect to the Cineast service.
     */
    public reconnectCineast() {
        this._factory.reconnect();
    }

    /**
     * Tries to re-connect to the Collabordinator service.
     */
    public reconnectCollabordinator() {
        this._collabordinator.connect();
    }

    /**
     * Returns true, if the Collabordinator service is available and false otherwise.
     */
    get collabordinatorAvailable() : boolean {
        return this._collabordinator.available();
    }

    /**
     * Getter for latency.
     *
     * @returns {number}
     */
    get latency() {
        return this._ping.asObservable().pipe(map(s => s.latency))
    }
}
