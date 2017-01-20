
import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {CineastAPI} from "../../services/api/cineast-api.service";
import {Ping, StatusType} from "../../types/messages.types";
import {Configuration} from "../../configuration/app.config";

@Component({
    selector: 'api-status',
    template:`
        <span >
            API Status:&nbsp;<md-icon style="vertical-align:text-bottom;">{{icon()}}</md-icon>&nbsp;{{latency ? '(' + latency + 'ms)' : ''}}
        </span>
    `
})

export class PingComponent implements OnInit {
    private _apistatus : StatusType = "DISCONNECTED";
    private last : number;
    private latency: number;

    /**
     * Default constructor. Subscribe for PING messages at the CineastAPI.
     *
     * @param _api
     * @param _config
     */
    constructor(private _api : CineastAPI, private _config : Configuration) {
        _api.observable()
            .filter(msg =>["PING"].indexOf(msg[0]) > -1)
            .subscribe((msg) => this.onMessage(msg[1]));
    }

    /**
     * Schedules a timer that pings the API every 10 seconds.
     */
    ngOnInit(): void {
        let timer  = Observable.timer(0,this._config.ping_interval);
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
     * @returns {any}
     */
    private icon() : string {
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
}