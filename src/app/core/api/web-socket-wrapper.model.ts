import {Subject} from "rxjs/Rx";
import {WebSocketSubjectConfig} from "rxjs/observable/dom/WebSocketSubject";
import {Observable} from "rxjs/Observable";

/**
 * This class wraps a WebSocket connection. It is usually produced by an instance of WebSocketFactoryService.
 */
export class WebSocketWrapper {

    /** Reference to the underlying WebSocket observable. */
    private readonly _socket;

    /** Flag indicating whether the current WebSocketWrapper was disconnected (manually). */
    private _disconnected = false;

    /**
     * Constructor for WebSocketWrapper class.
     *
     * @param {number} _retryAfter Time to wait until connection is re-established after inadvertent disconnect (values < 0 mean that no retry attempts will be made).
     * @param {Subject<any>} _config Subject that is connected to the Socket.
     */
    constructor(private readonly _retryAfter: number = -1, private readonly _config: WebSocketSubjectConfig) {
        if (this._retryAfter >= 0) {
            this._socket = Observable.webSocket(_config).retryWhen(error => {
                return error.flatMap(e => {
                    if (this._disconnected) {
                        console.log("Lost connection to " + _config.url + "; Retrying after " + _retryAfter + "ms");
                        return Observable.of(e);
                    } else {
                        console.log("Lost connection to " + _config.url + "; No retry since socket was invalidated.");
                        return Observable.empty();
                    }
                }).delay(_retryAfter);
            });
        } else {
            this._socket = Observable.webSocket(_config);
        }
    }

    /**
     * Getter for the underlying subject to the WebSocket.
     *
     * @return {Observable<any>}
     */
    get socket() {
        return this._socket;
    }

    /**
     * Completes the Subject associated with the WebSocket and caps the connection.
     */
    public disconnect() {
        this._disconnected = true;
        this._socket.complete();
    }

    /**
     * Sends an object to the underlying WebSocket. That object gets serialized to JSON before it's being sent.
     *
     * Important: All properties that start with an _ are filtered out when the object is stringified.
     *
     * @param object Object to send.
     */
    public send(object: any) {
        this.sendstr(JSON.stringify(object, (key, value) => {
            if (key.startsWith("_")) {
                return undefined;
            } else {
                return value
            }
        }));
    }

    /**
     * Sends a raw string to the underlying WebSocket stream. This method re-connects the socket if it is
     * currently disconnected.
     *
     * @param str String to write to the stream.
     */
    public sendstr(str: string) {
        this._socket.next(str);
    }
}