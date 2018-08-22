import {Inject, Injectable} from "@angular/core";
import {BehaviorSubject, Observable, Subject, Subscription, timer} from "rxjs";
import {WebSocketWrapper} from "../api/web-socket-wrapper.model";
import {WebSocketFactoryService} from "../api/web-socket-factory.service";
import {ConfigService} from "../basics/config.service";
import {filter, flatMap, map} from "rxjs/operators";
import {Message} from "../../shared/model/messages/interfaces/message.interface";
import {ApiStatus} from "../../shared/model/internal/api-status.model";
import {Ping} from "../../shared/model/messages/interfaces/responses/ping.interface";

@Injectable()
export class PingService extends BehaviorSubject<ApiStatus> {
    /** Timestamp of the last PING packet. */
    private _last : number = 0;

    /** Number of packets in transit. Reset after every response. */
    private _transit: number = 0;

    /** The WebSocketWrapper currently used by QueryService to process and issue queries. */
    private _socket: WebSocketWrapper;

    /** Reference to the running subscription to the WebSocket. */
    private _webSocketSubscription: Subscription;

    /**
     * Default constructor.
     *
     * @param _factory Reference to the WebSocketFactoryService. Gets injected by DI.
     * @param _config
     */
    constructor(@Inject(WebSocketFactoryService) _factory: WebSocketFactoryService, @Inject(ConfigService) _config: ConfigService) {
        super(new ApiStatus(Date.now(), "DISCONNECTED", Number.MAX_VALUE));
        _factory.asObservable()
            .pipe(filter(ws => ws != null))
            .subscribe(ws => {
            if (this._webSocketSubscription != null) {
                this._webSocketSubscription.unsubscribe();
            }
            this._socket = ws;
            this._webSocketSubscription = this._socket.socket.pipe(
                filter(msg => ["PING"].indexOf(msg.messageType) > -1)
            ).subscribe((msg: Message) => this.onPingResponse(<Ping>msg));
        });

        /* Subscribes to changes in the configuration file and dispatches the ping timer. */
        _config.asObservable().pipe(flatMap(c => timer(0, c.ping_interval))).subscribe(() => this.onTimer())
    }

    /**
     * Processes a Timer event; sens a new PING messages and logs the time. If the number of PING messages in transit
     * exceeds 1 then the ApiStatus is changed to DISCONNECTED.
     *
     * @param msg The Ping message received.
     */
    private onTimer() {
        if (this._socket) {
            this._last = Date.now();
            this._transit += 1;
            this._socket.send(<Message>{messageType: "PING"});
            if (this._transit > 1) {
                this.next(new ApiStatus(Date.now(), "DISCONNECTED", Number.MAX_VALUE));
                this._transit = 0;
            }
        }
    }

    /**
     * Processes a PING response. Calculates the latency in ms and publishes the new ApiStatus.
     *
     * @param msg The Ping message received.
     */
    private onPingResponse(msg: Ping) {
        let now = Date.now();
        this._transit -= 1;
        this.next(new ApiStatus(now, msg.status, now - this._last));
    }
}