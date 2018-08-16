import {Observable, Subject} from "rxjs";
import {retryWhen, delay, catchError, tap, take} from 'rxjs/operators';
import {webSocket, WebSocketSubject, WebSocketSubjectConfig} from 'rxjs/webSocket';
import {Message} from "../../shared/model/messages/interfaces/message.interface";

/**
 * This class wraps a WebSocket connection. It is usually produced by an instance of WebSocketFactoryService.
 */
export class WebSocketWrapper {

    /** Reference to the underlying WebSocket observable. */
    private readonly _socket: Observable<Message>;

    /** */
    private readonly _internalSocket: WebSocketSubject<Message>;

    /** Flag indicating whether the current WebSocketWrapper was disconnected (manually). */
    private _disconnected = false;

    /**
     * Constructor for WebSocketWrapper class.
     *
     * @param {number} _retryAfter Time to wait until connection is re-established after inadvertent disconnect (values < 0 mean that no retry attempts will be made).
     * @param {Subject<any>} _config Subject that is connected to the Socket.
     */
    constructor(private readonly _retryAfter: number = -1, private readonly _config: WebSocketSubjectConfig<Message>) {
        this._internalSocket = webSocket(_config);
        if (this._retryAfter >= 0) {
            this._socket = this._internalSocket.pipe(
                retryWhen(error => {
                    return error.pipe(
                        tap(e => {
                            if (!this._disconnected) {
                                console.log("Lost connection to " + _config.url + "; Retrying after " + _retryAfter + "ms");
                            } else {
                                console.log("Lost connection to " + _config.url + "; No retry since socket was invalidated.");
                            }
                        }),
                        delay(_retryAfter))
                })
            );
        } else {
            this._socket = this._internalSocket.pipe(
                catchError((err, observable) => {
                    console.log("Lost connection to " + _config.url + "; Connection will not be re-established!");
                    return observable;
                })
            );
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
        this._internalSocket.complete();
    }

    /**
     * Sends an object to the underlying WebSocket. That object gets serialized to JSON before it's being sent.
     *
     * Important: All properties that start with an _ are filtered out when the object is stringified.
     *
     * @param object Object to send.
     */
    public send(object: Message) {
        this._internalSocket.next(object);
    }
}