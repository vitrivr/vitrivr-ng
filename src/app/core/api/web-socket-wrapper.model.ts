import {Observable, of, EMPTY, Subject} from "rxjs";
import {retryWhen, flatMap, delay} from 'rxjs/operators';
import {webSocket, WebSocketSubjectConfig} from 'rxjs/webSocket';
import {Message} from "../../shared/model/messages/interfaces/message.interface";

/**
 * This class wraps a WebSocket connection. It is usually produced by an instance of WebSocketFactoryService.
 */
export class WebSocketWrapper {

    /** Reference to the underlying WebSocket observable. */
    private readonly _socket: Subject<Message>;

    /** Flag indicating whether the current WebSocketWrapper was disconnected (manually). */
    private _disconnected = false;

    /**
     * Constructor for WebSocketWrapper class.
     *
     * @param {number} _retryAfter Time to wait until connection is re-established after inadvertent disconnect (values < 0 mean that no retry attempts will be made).
     * @param {Subject<any>} _config Subject that is connected to the Socket.
     */
    constructor(private readonly _retryAfter: number = -1, private readonly _config: WebSocketSubjectConfig<Message>) {
        if (this._retryAfter >= 0) {
            this._socket = <Subject<Message>> (webSocket(_config).pipe(
                retryWhen(error => {
                    return error.pipe(
                        flatMap(e => {
                            if (this._disconnected) {
                                console.log("Lost connection to " + _config.url + "; Retrying after " + _retryAfter + "ms");
                                return of(e);
                            } else {
                                console.log("Lost connection to " + _config.url + "; No retry since socket was invalidated.");
                                return EMPTY;
                            }
                        }))
                }),
                delay(_retryAfter)
            ));
        } else {
            this._socket = webSocket(_config);
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
    public send(object: Message) {
        this._socket.next(object);
    }
}