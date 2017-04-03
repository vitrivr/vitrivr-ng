
import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {CineastAPI} from "../core/api/cineast-api.service";
import {StatusType, Ping} from "../shared/model/messages/interfaces/ping.interface";
import {ConfigService} from "../core/basics/config.service";

@Component({
    selector: 'api-status',
    template:`
        <span >
            <md-icon style="vertical-align:text-bottom;">{{getIcon()}}</md-icon>&nbsp;{{getLatency() ? '(' + getLatency() + 'ms)' : ''}}
        </span>
    `
})

export class PingComponent implements OnInit {
    private _apistatus : StatusType = "DISCONNECTED";
    private last : number;
    private  latency: number;

    /**
     * Default constructor. Subscribe for PING messages at the CineastAPI.
     *
     * @param _api
     */
    constructor(private _api : CineastAPI, private _config : ConfigService) {
        _api.observable()
            .filter(msg =>["PING"].indexOf(msg[0]) > -1)
            .subscribe((msg) => this.onMessage(msg[1]));
    }

    /**
     * Schedules a timer that pings the API every 10 seconds.
     */
    ngOnInit(): void {
        let timer  = Observable.timer(0, this._config.ping_interval);
        timer.subscribe(t => {
           this.last = Date.now();
           this._api.send({messagetype:'PING'});
        });
    }

    /**
     * Processes a response message and changes the
     * icon accordingly.
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