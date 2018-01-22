
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {CineastWebSocketFactoryService} from "../core/api/cineast-web-socket-factory.service";
import {StatusType, Ping} from "../shared/model/messages/interfaces/responses/ping.interface";
import {ConfigService} from "../core/basics/config.service";
import {Subscription} from "rxjs/Subscription";
import {WebSocketWrapper} from "../core/api/web-socket-wrapper.model";
import {Message} from "../shared/model/messages/interfaces/message.interface";

@Component({
    selector: 'api-status',
    template:`
        <span >
            <mat-icon style="vertical-align:text-bottom;">{{icon}}</mat-icon>&nbsp;{{latency < 100000 ? '(' + latency + 'ms)' : "(&#x221e;)"}}
        </span>
    `
})

export class PingComponent implements OnInit, OnDestroy {
    /** The current API status. */
    private _apistatus : StatusType = "DISCONNECTED";

    /** Timestamp of the last PING packet. */
    private _last : number = 0;

    /** Calculated latency. */
    private _latency: number = Number.MAX_VALUE;

    /** Number of packets in transit. Reset after every response. */
    private _transit: number = 0;

    /* Subscription to QueryService for further reference. */
    private _apiSubscription: Subscription;

    /* Subscription to Timer for further reference. */
    private _timerSubscription: Subscription;

    /**
     * Default constructor. Subscribe for PING messages at the CineastWebSocketFactoryService.
     *
     * @param _api
     * @param _configService
     */
    constructor(private _api : CineastWebSocketFactoryService, private _configService : ConfigService) {}

    /**
     * Lifecycle Hook (onInit): Subscribes to the API and the ConfigService.
     */
    public ngOnInit(): void {
        /* Subscribes to API changes. */
        this._apiSubscription = this._api.filter(c => c != null).map(c => c.socket.filter(msg => msg.messageType == "PING")).concatAll().subscribe((msg: Ping) => {
            this._apistatus = msg.status;
            this._transit = 0;
            this._latency = (Date.now() - this._last)
        });

        /* Subscribes to changes in the configuration file and dispatches the ping timer. */
        this._timerSubscription = this._configService.asObservable().map(c => Observable.timer(0, c.ping_interval)).concatAll().subscribe(() => {
            this._last = Date.now();
            this._transit +=1;
            this._api.getValue().send(<Message>{messageType: "PING"});
            if (this._transit > 1) {
                this._apistatus = "DISCONNECTED";
                this._latency = Number.MAX_VALUE;
                this._transit = 0;
            }
        })
    }

    /**
     * Lifecycle Hook (onDestroy): Unsubscribes from the API and the ConfigService subscription.
     */
    public ngOnDestroy(): void {
        this._apiSubscription.unsubscribe();
        this._timerSubscription.unsubscribe();
        this._apiSubscription = null;
        this._timerSubscription = null;
    }

    /**
     * Returns the icon name based on the current API status.
     *
     * @returns {any}
     */
    get icon() : string {
        switch (this._apistatus) {
            case 'DISCONNECTED':
                return 'flash_off';
            case 'ERROR':
                return 'error';
            case 'OK':
                return 'check_circle';
            default:
                return 'watch_later'
        }
    }

    /**
     * Getter for latency.
     *
     * @returns {number}
     */
    get latency() {
        return this._latency;
    }
}
