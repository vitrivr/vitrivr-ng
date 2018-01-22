import {Subject} from "rxjs/Rx";
import {until} from "selenium-webdriver";
import elementIsSelected = until.elementIsSelected;

/**
 * This class wraps a WebSocket connection. It is usually produces by an instance of WebSocketFactoryService.
 */
export class WebSocketWrapper {
    /**
     * Constructor for WebSocketWrapper class.
     *
     * @param {string} _url URL to which the WebSocket is connected.
     * @param {Subject<any>} _socket Subject that is connected to the Socket.
     * @param {number} _retryAfter Time to wait until connection is re-established after inadvertent disconnect (values < 0 mean that no retry attempts will be made).
     */
    constructor(private readonly _url: string, private readonly _socket: Subject<any>, private _retryAfter: number = -1) {}

    /**
     * Getter for the underlying subject to the WebSocket.
     *
     * @return {Observable<any>}
     */
    get socket() {
        if (this._retryAfter >= 0) {
            return this._socket.retryWhen(error => {
                return error.do(v => console.log("Lost connection to " + this._url + "; Retrying after " + this._retryAfter + "ms")).delay(this._retryAfter);
            });
        } else {
            return this._socket;
        }
    }

    /**
     * Completes the Subject associated with the WebSocket and caps the connection.
     */
    public disconnect() {
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