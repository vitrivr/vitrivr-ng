import {NEVER, Observable, Subject} from "rxjs";
import {retryWhen, delay, catchError} from 'rxjs/operators';
import {webSocket, WebSocketSubject, WebSocketSubjectConfig} from 'rxjs/webSocket';
import {Message} from "../../shared/model/messages/interfaces/message.interface";

/**
 * This class wraps a WebSocket connection. It is usually produced by an instance of WebSocketFactoryService.
 */
export class WebSocketWrapper {
    /** Reference to the underlying WebSocket observable. */
    private readonly _socket: Observable<Message>;

    /** Reference to the internal WebSocketSubject. */
    private readonly _internalSocket: WebSocketSubject<Message>;

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
                    console.log("Lost connection to " + _config.url + "; Retrying after " + _retryAfter + "ms");
                    return error.pipe(delay(_retryAfter));
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
     *
     */
    get endpoint() {
        return this._config.url;
    }

    /**
     * Completes the Subject associated with the WebSocket and caps the connection.
     */
    public disconnect() {
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