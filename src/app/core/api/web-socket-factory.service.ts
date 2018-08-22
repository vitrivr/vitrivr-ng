import {WebSocketSubjectConfig} from "rxjs/observable/dom/WebSocketSubject";
import {NextObserver} from "rxjs/src/Observer";
import {WebSocketWrapper} from "./web-socket-wrapper.model";
import {BehaviorSubject, NEVER, Observable} from "rxjs";
import {Message} from "../../shared/model/messages/interfaces/message.interface";
import {Inject, Injectable} from "@angular/core";
import {ConfigService} from "../basics/config.service";
import {delay, filter, map, retryWhen, tap} from "rxjs/operators";
import {webSocket} from "rxjs/webSocket";

/**
 * Custom type used to indicate the status of the WebSocket status.
 */
export type WebSocketStatus = "DISCONNECTED" | "CONNECTED" | "ERROR" ;

/**
 * This class exposes an observable that generates WebSocketWrapper classes whenever the connection configuration changes. Since only one WebSocketWrapper can be active
 * at a time per WebSocketFactoryService instance. The class keeps track of the WebSocketWrapper's and disconnects previous instances
 */
@Injectable()
export class WebSocketFactoryService extends BehaviorSubject<WebSocketWrapper> {

    /** Default constructor. */
    constructor(@Inject(ConfigService) private _configService : ConfigService) {
        super(null);
        this._configService.pipe(
            filter(c => c.endpoint_ws != null),
            map(c => this.create(c.endpoint_ws, 5000))
        ).subscribe(ws => this.next(ws))
    }

    /**
     * Establishes a connection to the provided endpoint and creates a new WebSocketWrapper. If the active WebSocketWrapper instance is
     * connected, that connection is dropped. Hence, it is advisable to check the WebSocketWrapper's status before using this method.
     *
     * @returns {any}
     */
    private create(url: string, _retryAfter: number = -1): WebSocketWrapper {
        /* Create observers for WebSocket status. */
        let openObserver = <NextObserver<Event>>{
            next: (ev: Event) => {
                console.log("WebSocket connected to " + url + ".");
            }
        };
        let closeObserver = <NextObserver<CloseEvent>>{
            next: (ev: CloseEvent) => {
                console.log("WebSocket disconnected from " + url + ". (Code: " + ev.code +")");
            }
        };

        /* Prepare config and create new WebSocket. */
        let config: WebSocketSubjectConfig<Message> = <WebSocketSubjectConfig<Message>>{
            url: url,
            openObserver: openObserver,
            closeObserver: closeObserver,
            serializer: (m: Message) => JSON.stringify(m, (key, value) => {
                if (key.startsWith("_")) {
                    return undefined;
                } else {
                    return value
                }
            })
        };
        return new WebSocketWrapper(_retryAfter, config);
    }
}