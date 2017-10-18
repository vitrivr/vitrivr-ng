
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {CineastAPI} from "../core/api/cineast-api.service";
import {StatusType, Ping} from "../shared/model/messages/interfaces/ping.interface";
import {ConfigService} from "../core/basics/config.service";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'api-status',
    template:`
        <span >
            <mat-icon style="vertical-align:text-bottom;">{{getIcon()}}</mat-icon>&nbsp;{{getLatency() ? '(' + getLatency() + 'ms)' : ''}}
        </span>
    `
})

export class PingComponent implements OnInit, OnDestroy {

    private _apistatus : StatusType = "DISCONNECTED";
    private last : number;
    private  latency: number;

    /* Subscription to QueryService for further reference. */
    private _apiSubscription: Subscription;

    /* Subscription to ConfigService for further reference. */
    private _configServiceSubscription: Subscription;

    /* Subscription to Timer for further reference. */
    private _timerSubscription: Subscription;

    /**
     * Default constructor. Subscribe for PING messages at the CineastAPI.
     *
     * @param _api
     * @param _configService
     */
    constructor(private _api : CineastAPI, private _configService : ConfigService) {}

    /**
     * Lifecycle Hook (onInit): Subscribes to the API and the ConfigService.
     */
    public ngOnInit(): void {
        /* Subscribes to API changes. */
        this._apiSubscription = this._api.observable()
            .filter(msg =>["PING"].indexOf(msg[0]) > -1)
            .subscribe((msg) => this.onMessage(msg[1]));

        /* Subscribes to changes in the configuration file. */
        this._configServiceSubscription = this._configService.observable.subscribe((config) => {
            if (this._timerSubscription) {
                this._timerSubscription.unsubscribe();
                this._timerSubscription = null;
            }
            this._timerSubscription = Observable.timer(0, config.ping_interval).subscribe(() => {
                this.last = Date.now();
                this._api.send({messageType:'PING'});
            })
        })
    }

    /**
     * Lifecycle Hook (onDestroy): Unsubscribes from the API and the ConfigService subscription.
     */
    public ngOnDestroy(): void {
        this._apiSubscription.unsubscribe();
        this._configServiceSubscription.unsubscribe();
        if (this._timerSubscription) this._timerSubscription.unsubscribe();
        this._apiSubscription = null;
        this._configServiceSubscription = null;
        this._timerSubscription = null;
    }

    /**
     * Processes a response message and changes the icon accordingly.
     *
     * @param msg
     */
    private onMessage(msg: string) {
        this._apistatus =  (<Ping>JSON.parse(msg)).status;
        this.latency = (Date.now() - this.last)
    }

    /**
     * Returns the icon name based on the current API status.
     *
     * @returns {any}
     */
    public getIcon() : string {
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
    public getLatency() {
        return this.latency;
    }
}
