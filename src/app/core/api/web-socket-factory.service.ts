import {Observable} from 'rxjs/Rx';
import {WebSocketSubjectConfig} from "rxjs/observable/dom/WebSocketSubject";
import {NextObserver} from "rxjs/src/Observer";
import {WebSocketWrapper} from "./web-socket-wrapper.model";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

/**
 * Custom type used to indicate the status of the WebSocket status.
 */
export type WebSocketStatus = "DISCONNECTED" | "CONNECTED" | "ERROR" ;

/**
 * This class generates WebSocketWrapper classes that provide access to a WebSocket connection. Only one WebSocketWrapper can be active at a time per WebSocketFactoryService instance.
 * The class keeps track of the WebSocketWrapper's it creates and notifies the observers, if the current WebSocketWrapper changes.
 */
export class WebSocketFactoryService extends BehaviorSubject<WebSocketWrapper> {
    /* Indication of the status status. */
    private _status: WebSocketStatus = "DISCONNECTED";

    /**
     * Establishes a connection to the provided endpoint and creates a new WebSocketWrapper. If the active WebSocketWrapper instance is
     * connected, that connection is dropped. Hence, it is advisable to check the WebSocketWrapper's status before using this method.
     *
     * @returns {any}
     */
    public connect(url: string, _retryAfter: number = -1) {
        /* Disconnect last connection if it exists. */
        if (this.getValue()) this.getValue().disconnect();

        /* Create observers for WebSocket status. */
        let openObserver = <NextObserver<Event>>{
            next: (ev: Event) => {
                console.log("WebSocket connected to " + url + ".");
                this._status = "CONNECTED";
            }
        };
        let closeObserver = <NextObserver<CloseEvent>>{
            next: (ev: CloseEvent) => {
                console.log("WebSocket disconnected from " + url + ". (Code: " + ev.code +")");
                this._status = "DISCONNECTED";
            }
        };

        /* Prepare config and create new WebSocket. */
        let config: WebSocketSubjectConfig = <WebSocketSubjectConfig>{
            url: url,
            openObserver: openObserver,
            closeObserver: closeObserver
        };
        this.next(new WebSocketWrapper(url, Observable.webSocket(config), _retryAfter));
    }
}